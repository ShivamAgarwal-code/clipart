export interface GenerationResult {
  styleId: string;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error?: string;
}

export interface GenerationState {
  sourceImage: string | null;
  results: GenerationResult[];
  isGenerating: boolean;
}
