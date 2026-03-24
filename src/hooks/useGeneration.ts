import { useState, useCallback } from 'react';
import { GenerationResult } from '../types';
import { generateClipart } from '../services/api';
import { CLIPART_STYLES } from '../constants/styles';

export function useGeneration() {
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAll = useCallback(
    async (imageUri: string, selectedStyles: string[]) => {
      setIsGenerating(true);

      // Initialize all results as pending
      const initialResults: GenerationResult[] = selectedStyles.map((styleId) => ({
        styleId,
        imageUrl: null,
        status: 'pending',
      }));
      setResults(initialResults);

      // Generate styles sequentially to avoid API rate limits
      for (const styleId of selectedStyles) {
        setResults((prev) =>
          prev.map((r) =>
            r.styleId === styleId ? { ...r, status: 'generating' } : r
          )
        );

        try {
          const resultUri = await generateClipart(imageUri, styleId);

          setResults((prev) =>
            prev.map((r) =>
              r.styleId === styleId
                ? { ...r, status: 'completed', imageUrl: resultUri }
                : r
            )
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Generation failed';
          setResults((prev) =>
            prev.map((r) =>
              r.styleId === styleId
                ? { ...r, status: 'error', error: message }
                : r
            )
          );
        }
      }
      setIsGenerating(false);
    },
    []
  );

  const generateSingle = useCallback(
    async (imageUri: string, styleId: string) => {
      setResults((prev) => {
        const existing = prev.find((r) => r.styleId === styleId);
        if (existing) {
          return prev.map((r) =>
            r.styleId === styleId
              ? { ...r, status: 'generating', error: undefined, imageUrl: null }
              : r
          );
        }
        return [...prev, { styleId, imageUrl: null, status: 'generating' }];
      });

      try {
        const resultUri = await generateClipart(imageUri, styleId);
        setResults((prev) =>
          prev.map((r) =>
            r.styleId === styleId
              ? { ...r, status: 'completed', imageUrl: resultUri }
              : r
          )
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Generation failed';
        setResults((prev) =>
          prev.map((r) =>
            r.styleId === styleId
              ? { ...r, status: 'error', error: message }
              : r
          )
        );
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setIsGenerating(false);
  }, []);

  return { results, isGenerating, generateAll, generateSingle, clearResults };
}
