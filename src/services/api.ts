import { File, Paths } from 'expo-file-system';
import { CLIPART_STYLES } from '../constants/styles';

const API_BASE_URL = 'https://clipart-1l14.onrender.com';

export async function generateClipart(
  imageUri: string,
  styleId: string,
  onProgress?: (status: string) => void
): Promise<string> {
  const style = CLIPART_STYLES.find((s) => s.id === styleId);
  if (!style) throw new Error('Invalid style');

  onProgress?.('Preparing image...');

  // Read the image as base64
  const sourceFile = new File(imageUri);
  const base64 = await sourceFile.base64();

  onProgress?.('Sending to AI...');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64,
        prompt: style.prompt,
        style: styleId,
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check your network and try again.');
    }
    throw new Error(
      `Network request failed. Make sure the backend is running at ${API_BASE_URL}`
    );
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Server error: ${response.status}`);
  }

  onProgress?.('Processing result...');

  const data = await response.json();

  if (!data.image) {
    throw new Error('No image returned from server');
  }

  // Save the base64 image to a local file
  const filename = `clipart_${styleId}_${Date.now()}.png`;
  const outputFile = new File(Paths.cache, filename);
  const imageData = data.image.replace(/^data:image\/\w+;base64,/, '');

  await outputFile.write(imageData, { encoding: 'base64' });

  return outputFile.uri;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
