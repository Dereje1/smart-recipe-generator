import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
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
  const [isComplete, setIsComplete] = useState(false);
  const [loadingType, setLoadingType] = useState<'generation' | 'saving'>('generation')

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
      setIsComplete(false);
      setLoadingType('generation');

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

      setGeneratedRecipes(parsedRecipes);
      setIsComplete(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(step + 1);
      }, 500); // Smooth transition after completion
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleRecipeSubmit = async (recipes: Recipe[]) => {
    try {
      setIsLoading(true);
      setIsComplete(false);
      setLoadingType('saving');
      await call_api({
        address: '/api/save-recipes',
        method: 'post',
        payload: { recipes },
      });
      setIsComplete(true);

      setTimeout(() => {
        setIsLoading(false);
        setIngredients(initialIngredients);
        setPreferences(initialPreferences);
        setGeneratedRecipes(initialRecipes);
        setSelectedRecipeIds(initialSelectedIds);
        setStep(0);
        router.push('/Profile');
      }, 500);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const isWideLayout = step >= 3;

  return recipeCreationData.reachedLimit ? (
    <LimitReached
      message="You have reached the maximum number of interactions with our AI services. Please try again later."
      actionText="Go to Home"
      fullHeight
    />
  ) : (
<div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-white p-8">
  {/* Fixed Navigation */}
  <div className="fixed top-20 inset-x-0 flex flex-col items-center justify-center p-2 z-20">
    <div
      className={`w-full bg-white shadow-lg rounded-2xl p-8 transition-all duration-300 ease-in-out ${isWideLayout ? 'max-w-7xl' : 'max-w-3xl'}`}
    >
      <div className="flex flex-col items-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-800 sm:text-2xl md:text-3xl">
            Step {step + 1}: {steps[step]}
          </h2>
        </div>

        <div className="flex justify-between w-full mt-6">
          {/* Prev Button */}
          <button
            type="button"
            className={`flex items-center justify-center bg-gray-200 text-gray-700 rounded-full px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 ${step === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={() => updateStep(-1)}
            disabled={step === 0}
            aria-label="Go to previous step"
          >
            <ChevronLeftIcon className="block mr-2 h-5 w-5"/>
            Prev
          </button>

          {/* Next Button */}
          <button
            type="button"
            className={`flex items-center justify-center bg-brand-600 text-white rounded-full px-4 py-2 transition duration-300 ease-in-out hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 ${step === steps.length - 1 || (step === 2 && !generatedRecipes.length) ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={() => updateStep(+1)}
            disabled={step === steps.length - 1 || (step === 2 && !generatedRecipes.length)}
            aria-label="Go to next step"
          >
            Next
            <ChevronRightIcon className="block ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Main Content with Top Padding to Avoid Overlap */}
  <div className="w-full pt-40 overflow-auto max-w-7xl">
    {isLoading ? (
      <Loading isProgressBar isComplete={isComplete} loadingType={loadingType}/>
    ) : (
      <StepComponent
        step={step}
        ingredientList={recipeCreationData.ingredientList}
        ingredients={ingredients}
        updateIngredients={setIngredients}
        preferences={preferences}
        updatePreferences={setPreferences}
        editInputs={() => setStep(0)}
        handleIngredientSubmit={handleIngredientSubmit}
        generatedRecipes={generatedRecipes}
        updateSelectedRecipes={setSelectedRecipeIds}
        selectedRecipes={selectedRecipeIds}
        handleRecipeSubmit={handleRecipeSubmit}
      />
    )}
  </div>
</div>

  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return await getServerSidePropsUtility(context, 'api/get-ingredients', 'recipeCreationData');
};

export default Navigation;
