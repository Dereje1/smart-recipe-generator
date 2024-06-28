import React from 'react';
import { Button } from '@headlessui/react'
import DietaryPreferences from './DietaryPreferences';

type ingredient = {
    name: string
    quantity: number
    id: number
}

interface Review {
    ingredients: ingredient[]
    dietaryPreference: string[]
    onSubmit: () => void
    onEdit: () => void
}

const ReviewComponent = ({ ingredients, dietaryPreference, onSubmit, onEdit }: Review) => {
    return (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-10">
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">Review Your Selections</div>

                <h3 className="text-gray-700 font-semibold text-lg">Ingredients:</h3>
                <div className="mb-4 flex flex-wrap">
                    {ingredients.map((ingredient) => (
                        <li key={ingredient.name} className="flex justify-between gap-x-6 py-2">
                            <div className="flex min-w-0 gap-x-4">
                                <div className="min-w-0 flex-auto">
                                    <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">{`${ingredient.name}${ingredient.quantity > 0 ? ` (${ingredient.quantity})` : ''}`}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </div>
                <h3 className="text-gray-700 font-semibold text-lg">Dietary Preference:</h3>
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
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-500 data-[disabled]:bg-gray-200"
                        disabled={!ingredients.length}
                    >
                        Get Recipes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReviewComponent;
