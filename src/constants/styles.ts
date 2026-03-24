export interface ClipArtStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  color: string;
}

export const CLIPART_STYLES: ClipArtStyle[] = [
  {
    id: 'cartoon',
    name: 'Cartoon',
    icon: '🎨',
    description: 'Bold outlines, vibrant colors',
    prompt: 'Transform this photo into a cartoon-style clipart illustration with bold black outlines, vibrant flat colors, exaggerated features, and a clean white background. Make it look like a professional cartoon character design. Keep the person recognizable.',
    color: '#FF6B6B',
  },
  {
    id: 'flat',
    name: 'Flat Art',
    icon: '🖼️',
    description: 'Modern flat illustration',
    prompt: 'Transform this photo into a modern flat illustration style clipart with geometric shapes, minimal shading, pastel color palette, and clean vector-like appearance on a white background. Keep the person recognizable with simplified but accurate features.',
    color: '#4ECDC4',
  },
  {
    id: 'anime',
    name: 'Anime',
    icon: '✨',
    description: 'Japanese anime style',
    prompt: 'Transform this photo into a high-quality anime/manga style illustration with large expressive eyes, detailed hair, clean linework, anime-style shading, and vibrant colors on a clean background. Make it look like a professional anime character portrait. Keep the person recognizable.',
    color: '#A29BFE',
  },
  {
    id: 'pixel',
    name: 'Pixel Art',
    icon: '👾',
    description: 'Retro pixel art style',
    prompt: 'Transform this photo into detailed pixel art style with visible pixels, retro 16-bit video game aesthetic, limited but vibrant color palette, and clean pixel-perfect design on a clean background. Keep the person recognizable in pixel form.',
    color: '#FDCB6E',
  },
  {
    id: 'sketch',
    name: 'Sketch',
    icon: '✏️',
    description: 'Pencil sketch outline',
    prompt: 'Transform this photo into a detailed pencil sketch style illustration with fine line work, cross-hatching for shading, artistic hand-drawn quality, and clean white background. Make it look like a professional artist sketch portrait. Keep the person recognizable.',
    color: '#636E72',
  },
];
