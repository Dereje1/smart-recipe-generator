import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@headlessui/react'
import IngredientForm from './IngredientForm';
import DietaryPreferences from './DietaryPreferences';
import ReviewComponent from './Review';
import SelectRecipesComponent from './SelectRecipes';
import call_api from './call_api';
import { Ingredient, DietaryPreference, Recipe } from '../../../types/index'
import stub from './stub_response.json';

const steps = ['Add Ingredients', 'Choose Diet', 'Review Ingredients', 'Select Recipes', 'Review Selected Recipes', 'Finalize Recipes']


const initialIngridients: Ingredient[] = []
const initialPreferences: DietaryPreference[] = [];
const initialRecipes: Recipe[] = [];
const initialSelectedIds: string[] = [];

interface StepComponentProps {
    step: number,
    ingredients: Ingredient[],
    updateIngredients: (ingredients: Ingredient[]) => void
    preferences: DietaryPreference[]
    updatePreferences: (preferences: DietaryPreference[]) => void
    editInputs: () => void
    handleSubmit: () => void
    generatedRecipes: Recipe[]
    updateSelectedRecipes: (ids: string[]) => void
    selectedRecipes: string[]
}

function StepComponent({
    step,
    ingredients,
    updateIngredients,
    preferences,
    updatePreferences,
    editInputs,
    handleSubmit,
    generatedRecipes,
    selectedRecipes,
    updateSelectedRecipes
}: StepComponentProps) {
    switch (step) {
        case 0:
            return (
                <IngredientForm
                    ingredients={ingredients}
                    updateIngredients={updateIngredients}
                    generatedRecipes={generatedRecipes}
                />
            );
        case 1:
            return (
                <DietaryPreferences
                    preferences={preferences}
                    updatePreferences={updatePreferences}
                    generatedRecipes={generatedRecipes}
                />
            )
        case 2:
            return (
                <ReviewComponent
                    ingredients={ingredients}
                    dietaryPreference={preferences}
                    onEdit={editInputs}
                    onSubmit={handleSubmit}
                    generatedRecipes={generatedRecipes}
                />
            )
        case 3:
            return (
                <SelectRecipesComponent
                    generatedRecipes={generatedRecipes}
                    selectedRecipes={selectedRecipes}
                    updateSelectedRecipes={updateSelectedRecipes}
                />
            )
        default:
            return <h1 className="text-center">Not ready yet!</h1>;
    }

}

export default function Navigation() {
    const [step, setStep] = useState(0);
    const [ingredients, setIngredients] = useState(initialIngridients)
    const [preferences, setPreferences] = useState(initialPreferences)
    const [generatedRecipes, setGeneratedRecipes] = useState(initialRecipes)
    const [selectedRecipeIds, setSelectedRecipeIds] = useState(initialSelectedIds)

    const updateStep = (val: number) => {
        let newStep = step + val
        if (newStep < 0 || newStep >= steps.length) newStep = 0
        setStep(newStep)
    }

    const handleIngredientSubmit = async () => {
        try {
            const result = await call_api(ingredients, preferences);
            let recipes = JSON.parse(stub);
            recipes = recipes.map((recipe: Recipe) => ({
                ...recipe,
                id: uuidv4()
            }))
            setGeneratedRecipes(recipes)
            setStep(step + 1)
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center justify-center">
                <p className="text-black mt-2 font-bold italic text-lg">{steps[step]}</p>
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
                            disabled={step === steps.length - 1 || step === 2 && !generatedRecipes}
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
            <StepComponent
                step={step}
                ingredients={ingredients}
                updateIngredients={(ingredients: Ingredient[]) => setIngredients(ingredients)}
                preferences={preferences}
                updatePreferences={(preferences: DietaryPreference[]) => setPreferences(preferences)}
                editInputs={() => setStep(0)}
                handleSubmit={handleIngredientSubmit}
                generatedRecipes={generatedRecipes}
                updateSelectedRecipes={(selectedIds) => setSelectedRecipeIds(selectedIds)}
                selectedRecipes={selectedRecipeIds}
            />
        </>
    )
}
