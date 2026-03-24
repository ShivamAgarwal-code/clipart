const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Rate limiting - simple in-memory store
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + RATE_LIMIT_WINDOW;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  next();
}

app.use('/api', rateLimit);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Sanitize prompt to reduce content policy rejections
function sanitizePrompt(prompt) {
  return prompt
    .replace(/\bperson\b/gi, 'character')
    .replace(/\bphoto\b/gi, 'image')
    .replace(/\byourself\b/gi, 'the subject');
}

// Describe the image using GPT-4o vision
async function describeImage(apiKey, base64Image) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe the subject in this image for an illustrator: overall appearance, clothing, pose, expression, hair, and any notable features. Be specific but keep it concise. Do not mention race or ethnicity. Focus on visual details an artist would need.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('Vision API error:', err);
    throw new Error('Failed to analyze image');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Generate image with DALL-E 3, with one retry using a softened prompt
async function generateWithDalle(apiKey, prompt, style) {
  const sanitized = sanitizePrompt(prompt);

  for (let attempt = 0; attempt < 2; attempt++) {
    const finalPrompt = attempt === 0
      ? sanitized
      : `Create a simple, family-friendly ${style || 'cartoon'} style illustration: ${sanitized}`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: finalPrompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
        quality: 'standard',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const image = data.data[0]?.b64_json;
      if (image) return image;
    }

    const err = await response.json().catch(() => ({}));
    const isContentPolicy = err.error?.code === 'content_policy_violation';
    console.error(`DALL-E attempt ${attempt + 1} error:`, err);

    if (!isContentPolicy || attempt === 1) {
      throw new Error(isContentPolicy
        ? 'Image was flagged by safety filters. Try a different photo.'
        : 'Failed to generate clipart');
    }
    // Retry with softened prompt
  }
}

// Generate clipart using OpenAI
app.post('/api/generate', upload.single('image'), async (req, res) => {
  try {
    const { prompt, style } = req.body;

    if (!req.file && !req.body.imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    let base64Image;
    if (req.file) {
      base64Image = req.file.buffer.toString('base64');
    } else {
      base64Image = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
    }

    // Step 1: Describe the image with GPT-4o vision
    const description = await describeImage(apiKey, base64Image);

    // Step 2: Generate clipart with DALL-E 3
    const fullPrompt = `${prompt}\n\nSubject description: ${description}`;
    const generatedImage = await generateWithDalle(apiKey, fullPrompt, style);

    res.json({
      image: `data:image/png;base64,${generatedImage}`,
      style: style,
    });
  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
