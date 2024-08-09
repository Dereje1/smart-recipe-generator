import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Button } from '@headlessui/react'
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import Loading from '../components/Loading';
import StepComponent from '../components/Recipe_Creation/StepComponent';
import { call_api } from '../utils/utils';
import { getServerSidePropsUtility } from '../utils/utils';
import { Ingredient, DietaryPreference, Recipe, IngredientDocumentType } from '../types/index'

const steps = ['Choose Ingredients', 'Choose Diet', 'Review and Create Recipes', 'Select Recipes', 'Review and Save Recipes']


const initialIngridients: Ingredient[] = []
const initialPreferences: DietaryPreference[] = [];
const initialRecipes: Recipe[] = [];
const initialSelectedIds: string[] = [];

function Navigation({ ingredientList }: { ingredientList: IngredientDocumentType[] }) {
    const [step, setStep] = useState(0);
    const [ingredients, setIngredients] = useState(initialIngridients)
    const [preferences, setPreferences] = useState(initialPreferences)
    const [generatedRecipes, setGeneratedRecipes] = useState(initialRecipes)
    const [selectedRecipeIds, setSelectedRecipeIds] = useState(initialSelectedIds)
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter();
    const { oldIngredients } = router.query;

    useEffect(() => {
        if (oldIngredients && Array.isArray(oldIngredients)) {
            setIngredients(oldIngredients.map(i => ({ name: i, quantity: null, id: uuidv4() })))
        }
    }, [oldIngredients])

    const updateStep = (val: number) => {
        let newStep = step + val
        if (newStep < 0 || newStep >= steps.length) newStep = 0
        setStep(newStep)
    }

    const handleIngredientSubmit = async () => {
        try {
            setIsLoading(true);
            const { recipes, openaiPromptId } = await call_api({
                address: '/api/generate-recipes',
                method: 'post',
                payload: {
                    ingredients,
                    dietaryPreferences: preferences,
                }
            });
            let parsedRecipes = JSON.parse(recipes);
            parsedRecipes = parsedRecipes.map((recipe: Recipe, idx: number) => ({
                ...recipe,
                openaiPromptId: `${openaiPromptId}-${idx}` // make unique for client key iteration
            }))
            setIsLoading(false)
            setGeneratedRecipes(parsedRecipes)
            setStep(step + 1)
        } catch (error) {
            console.log(error)
        }
    }

    const handleRecipeSubmit = async (recipes: Recipe[]) => {
        try {
            setIsLoading(true);
            await call_api({ address: '/api/save-recipes', method: 'post', payload: { recipes } });
            setIsLoading(false)
            setIngredients(initialIngridients)
            setPreferences(initialPreferences)
            setGeneratedRecipes(initialRecipes)
            setSelectedRecipeIds(initialSelectedIds)
            setStep(0)
            router.push('/Profile');
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-blue-700 bg-blue-100 rounded-lg p-3 mb-5 mt-5 shadow-md">
                    {steps[step]}
                </span>
                <p className="text-black mt-2 font-bold italic text-lg"></p>
                <div className="flex items-center justify-center">
                    <div className="w-[400px]  text-white p-4 flex justify-between mt-2">
                        <Button
                            type="button"
                            className="bg-sky-600 text-white rounded-l-md border-r border-gray-100 py-2 hover:bg-sky-500 hover:text-white px-3 data-[disabled]:bg-gray-200"
                            onClick={() => updateStep(-1)}
                            disabled={step === 0}
                        >
                            <div className="flex flex-row align-middle">
                                <svg className="w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
                                </svg>
                                <p className="ml-2">Prev</p>
                            </div>
                        </Button>
                        <Button
                            type="button"
                            className="bg-sky-600 text-white rounded-r-md py-2 border-l border-gray-100 hover:bg-sky-500 hover:text-white px-3 data-[disabled]:bg-gray-200"
                            onClick={() => updateStep(+1)}
                            disabled={step === steps.length - 1 || step === 2 && !generatedRecipes.length}
                        >
                            <div className="flex flex-row align-middle">
                                <span className="mr-2">Next</span>
                                <svg className="w-5 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
            {
                isLoading ?
                    <Loading />
                    :
                    <StepComponent
                        step={step}
                        ingredientList={ingredientList}
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
            }

        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/get-ingredients', 'ingredientList')
};

export default Navigation;