import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import Loading from '../components/Loading';
import StepComponent from '../components/Recipe_Creation/StepComponent';
import LimitReached from '../components/Recipe_Creation/LimitReached';
import { call_api, getServerSidePropsUtility } from '../utils/utils';
import { Ingredient, DietaryPreference, Recipe, IngredientDocumentType } from '../types/index';

const steps = [
  'Choose Ingredients',
  'Choose Diet',
  'Review and Create Recipes',
  'Select Recipes',
  'Review and Save Recipes',
];

const initialIngredients: Ingredient[] = [];
const initialPreferences: DietaryPreference[] = [];
const initialRecipes: Recipe[] = [];
const initialSelectedIds: string[] = [];

function Navigation({
  recipeCreationData,
}: {
  recipeCreationData: {
    ingredientList: IngredientDocumentType[];
    reachedLimit: boolean;
  };
}) {
  const [step, setStep] = useState(0);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [generatedRecipes, setGeneratedRecipes] = useState(initialRecipes);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(initialSelectedIds);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { oldIngredients } = router.query;

  useEffect(() => {
    if (oldIngredients && Array.isArray(oldIngredients)) {
      setIngredients(
        oldIngredients.map((i) => ({ name: i, quantity: null, id: uuidv4() }))
      );
    }
  }, [oldIngredients]);

  const updateStep = (val: number) => {
    let newStep = step + val;
    if (newStep < 0 || newStep >= steps.length) newStep = 0;
    setStep(newStep);
  };

  const handleIngredientSubmit = async () => {
    try {
      setIsLoading(true);
      const { recipes, openaiPromptId } = await call_api({
        address: '/api/generate-recipes',
        method: 'post',
        payload: {
          ingredients,
          dietaryPreferences: preferences,
        },
      });
      let parsedRecipes = JSON.parse(recipes);
      parsedRecipes = parsedRecipes.map((recipe: Recipe, idx: number) => ({
        ...recipe,
        openaiPromptId: `${openaiPromptId}-${idx}`, // Make unique for client key iteration
      }));
      setIsLoading(false);
      setGeneratedRecipes(parsedRecipes);
      setStep(step + 1);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleRecipeSubmit = async (recipes: Recipe[]) => {
    try {
      setIsLoading(true);
      await call_api({
        address: '/api/save-recipes',
        method: 'post',
        payload: { recipes },
      });
      setIsLoading(false);
      setIngredients(initialIngredients);
      setPreferences(initialPreferences);
      setGeneratedRecipes(initialRecipes);
      setSelectedRecipeIds(initialSelectedIds);
      setStep(0);
      router.push('/Profile');
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // Determine if current step is 4 or 5 (index 3 or 4)
  const isWideLayout = step >= 3;

  return recipeCreationData.reachedLimit ? (
    <LimitReached
      message="You have reached the maximum number of interactions with our AI services. Please try again later."
      actionText="Go to Home"
    />
  ) : (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-white p-8">
      {/* Fixed container for navigation */}
      <div className="fixed top-20 inset-x-0 flex flex-col items-center justify-center p-2">
        <div
          className={`w-full bg-white shadow-lg rounded-2xl p-8 transition-all duration-300 ease-in-out ${isWideLayout ? 'max-w-7xl' : 'max-w-3xl'
            }`}
        >
          <div className="flex flex-col items-center">
            {/* Combined Header with Enhanced Styling */}
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-800 sm:text-2xl md:text-3xl">
                Step {step + 1}: {steps[step]}
              </h2>
            </div>
            {/* Enhanced Navigation Buttons */}
            <div className="flex justify-between w-full mt-6">
              {/* Prev Button */}
              <button
                type="button"
                className={`flex items-center justify-center bg-gray-200 text-gray-700 rounded-full px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${step === 0 ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                onClick={() => updateStep(-1)}
                disabled={step === 0}
                aria-label="Go to previous step"
              >
                {/* Left Arrow Icon */}
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              {/* Next Button */}
              <button
                type="button"
                className={`flex items-center justify-center bg-indigo-600 text-white rounded-full px-4 py-2 transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${step === steps.length - 1 || (step === 2 && !generatedRecipes.length)
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                  }`}
                onClick={() => updateStep(+1)}
                disabled={step === steps.length - 1 || (step === 2 && !generatedRecipes.length)}
                aria-label="Go to next step"
              >
                Next
                {/* Right Arrow Icon */}
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main content area adjusted for fixed navigation */}
      <>
        {isLoading ? (
          <Loading />
        ) : (
          <StepComponent
            step={step}
            ingredientList={recipeCreationData.ingredientList}
            ingredients={ingredients}
            updateIngredients={(ingredients: Ingredient[]) => setIngredients(ingredients)}
            preferences={preferences}
            updatePreferences={(preferences: DietaryPreference[]) => setPreferences(preferences)}
            editInputs={() => setStep(0)}
            handleIngredientSubmit={handleIngredientSubmit}
            generatedRecipes={generatedRecipes}
            updateSelectedRecipes={(selectedIds) => setSelectedRecipeIds(selectedIds)}
            selectedRecipes={selectedRecipeIds}
            handleRecipeSubmit={handleRecipeSubmit}
          />
        )}
      </>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return await getServerSidePropsUtility(context, 'api/get-ingredients', 'recipeCreationData');
};

export default Navigation;
