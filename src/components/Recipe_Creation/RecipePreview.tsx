import RecipeCard from '../RecipeCard';
import { Recipe } from '../../types/index';

interface RecipePreviewProps {
  generatedRecipes: Recipe[];
  selectedRecipes: string[];
}

export default function RecipePreview({ generatedRecipes, selectedRecipes }: RecipePreviewProps) {
  const previewRecipes = selectedRecipes.length
    ? generatedRecipes.filter(r => selectedRecipes.includes(r.openaiPromptId))
    : generatedRecipes;

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 sticky top-20 overflow-y-auto max-h-screen">
      <h2 className="text-xl font-semibold mb-4">Recipe Preview</h2>
      {previewRecipes.length === 0 ? (
        <p className="text-gray-500">Generated recipes will appear here.</p>
      ) : (
        <div className="space-y-6">
          {previewRecipes.map(recipe => (
            <RecipeCard
              key={recipe.openaiPromptId}
              recipe={recipe}
              selectedRecipes={selectedRecipes}
              removeMargin
            />
          ))}
        </div>
      )}
    </div>
  );
}
