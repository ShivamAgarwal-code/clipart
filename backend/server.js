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

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: (() => {
        const FormData = require('form-data');
        const form = new FormData();
        const imageBuffer = Buffer.from(base64Image, 'base64');
        form.append('image', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
        form.append('prompt', prompt);
        form.append('n', '1');
        form.append('size', '1024x1024');
        form.append('response_format', 'b64_json');
        return form;
      })(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);

      // Fallback to chat completions with vision for image-to-image
      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  text: `Describe this person in detail for image generation: their appearance, clothing, pose, expression, hair style and color, and any distinguishing features. Be very specific and detailed.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!chatResponse.ok) {
        const chatError = await chatResponse.json().catch(() => ({}));
        console.error('Chat API error:', chatError);
        return res.status(500).json({ error: 'Failed to process image' });
      }

      const chatData = await chatResponse.json();
      const description = chatData.choices[0]?.message?.content || '';

      // Now generate the clipart using DALL-E with the description
      const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${prompt}\n\nPerson description: ${description}`,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json',
          quality: 'standard',
        }),
      });

      if (!dalleResponse.ok) {
        const dalleError = await dalleResponse.json().catch(() => ({}));
        console.error('DALL-E API error:', dalleError);
        return res.status(500).json({ error: 'Failed to generate clipart' });
      }

      const dalleData = await dalleResponse.json();
      const generatedImage = dalleData.data[0]?.b64_json;

      if (!generatedImage) {
        return res.status(500).json({ error: 'No image generated' });
      }

      return res.json({
        image: `data:image/png;base64,${generatedImage}`,
        style: style,
      });
    }

    const data = await response.json();
    const generatedImage = data.data[0]?.b64_json;

    if (!generatedImage) {
      return res.status(500).json({ error: 'No image generated' });
    }

    res.json({
      image: `data:image/png;base64,${generatedImage}`,
      style: style,
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
