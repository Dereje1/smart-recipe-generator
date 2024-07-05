import React from 'react';
import { Button } from '@headlessui/react'
import { Ingredient, DietaryPreference, Recipe } from '../../types/index'

interface ReviewComponentProps {
    ingredients: Ingredient[]
    dietaryPreference: DietaryPreference[]
    onSubmit: () => void
    onEdit: () => void
    generatedRecipes: Recipe[]
}

const ReviewComponent = ({ ingredients, dietaryPreference, onSubmit, onEdit, generatedRecipes }: ReviewComponentProps) => {
    return (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-10">
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">Review Your Selections</div>
                {ingredients.length < 3 ? <p className="text-sm text-red-300">Please select at least 3 ingredients to proceed with recipe creation.</p> : null}
                <h3 className="text-gray-700 font-semibold text-lg">Ingredients:</h3>
                <div className="mb-4 flex flex-wrap">
                    {ingredients.map((ingredient) => (
                        <li key={ingredient.name} className="flex justify-between gap-x-6 py-2">
                            <div className="flex min-w-0 gap-x-4">
                                <div className="min-w-0 flex-auto">
                                    <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">{`${ingredient.name}${ingredient.quantity ? ` (${ingredient.quantity})` : ''}`}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </div>
                <h3 className="text-gray-700 font-semibold text-lg">Dietary Preference:{dietaryPreference.length ? '' : ' None'}</h3>
                <div className="mb-5 mt-2 flex flex-wrap">
                    {
                        dietaryPreference.map((preference) => (
                            <span key={preference} className="bg-purple-100 text-purple-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">{preference}</span>
                        ))
                    }
                </div>
                <div className="flex justify-between mt-4">
                    <Button
                        onClick={onEdit}
                        className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-500 data-[disabled]:bg-gray-200"
                        disabled={Boolean(generatedRecipes.length)}
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-sky-500 data-[disabled]:bg-gray-200"
                        disabled={ingredients.length < 3 || Boolean(generatedRecipes.length)}
                    >
                        Create Recipes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReviewComponent;
