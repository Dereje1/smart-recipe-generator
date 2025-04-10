import { useEffect, useState } from 'react';
import { call_api } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

export const useRecipeData = (recipeId?: string) => {
  const [recipeData, setRecipeData] = useState<ExtendedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) return;

    const fetchRecipe = async () => {
      try {
        const data = await call_api({
          address: `/api/get-single-recipe?recipeId=${recipeId}`,
        });
        setRecipeData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  return { recipeData, loading, error, setRecipeData, setLoading };
};
