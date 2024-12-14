import React, { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import { PencilIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Ingredient, DietaryPreference, Recipe } from '../../types/index';

interface ReviewComponentProps {
  ingredients: Ingredient[];
  dietaryPreference: DietaryPreference[];
  onSubmit: () => void;
  onEdit: () => void;
  generatedRecipes: Recipe[];
}

const ReviewComponent = ({
  ingredients,
  dietaryPreference,
  onSubmit,
  onEdit,
  generatedRecipes,
}: ReviewComponentProps) => {
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      setWindowHeight(window.innerHeight);
    };

    // Set initial height
    updateHeight();

    // Update on window resize
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div
      className="fixed top-36 mt-32 pl-2 left-1/2 transform -translate-x-1/2 px-4 py-6 bg-white shadow-md rounded-xl sm:max-w-xl mx-auto"
      style={{ width: '98%' }}
    >
      <div className="px-1 py-1">
        {/* Enhanced Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-medium text-gray-800 sm:text-3xl">
            Review Your Selections
          </h2>
          {ingredients.length < 3 && (
            <p className="text-sm text-red-500 mt-2">
              Please select at least 3 ingredients to proceed with recipe creation.
            </p>
          )}
        </div>

        {/* Ingredients Section */}
        <div className="mb-6">
          <h3 className="text-gray-700 font-semibold text-lg mb-2">{`${ingredients.length} Ingredient${ingredients.length !== 1 ? 's:' : ':'}`}</h3>
          <ul
            className="flex flex-wrap gap-2 w-full sm:max-h-none sm:overflow-y-visible overflow-y-auto"
            style={{ maxHeight: windowHeight <= 800 ? '60px' : '150px' }}
          >
            {ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {ingredient.name}
                {ingredient.quantity && (
                  <span className="ml-1 text-xs text-green-600">
                    ({ingredient.quantity})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Dietary Preferences Section */}
        <div className="mb-6">
          <h3 className="text-gray-700 font-semibold text-lg mb-2">
            {`${dietaryPreference.length} Dietary Preference${dietaryPreference.length !== 1 ? 's:' : ':'}`}
          </h3>
          <div
            className="flex flex-wrap gap-2 overflow-y-auto"
            style={{ maxHeight: '70px' }}
          >
            {dietaryPreference.map((preference) => (
              <span
                key={preference}
                className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {preference}
              </span>
            ))}
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex justify-between mt-8">
          {/* Edit Button */}
          <Button
            onClick={onEdit}
            className={`flex items-center justify-center bg-gray-200 text-gray-700 
                px-2 py-2 sm:px-4 sm:py-2 
                rounded-full transition duration-300 ease-in-out 
                hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                ${generatedRecipes.length ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={Boolean(generatedRecipes.length)}
            aria-label="Edit your selections"
          >
            <PencilIcon
              className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2"
              aria-hidden="true"
            />
            <span className="text-sm sm:text-base">Edit</span>
          </Button>

          {/* Create Recipes Button */}
          <Button
            onClick={onSubmit}
            className={`flex items-center justify-center bg-green-600 text-white 
                px-2 py-2 sm:px-4 sm:py-2 
                rounded-full transition duration-300 ease-in-out 
                hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                ${ingredients.length < 3 || generatedRecipes.length
                ? 'cursor-not-allowed opacity-50'
                : ''
              }`}
            disabled={ingredients.length < 3 || Boolean(generatedRecipes.length)}
            aria-label="Create recipes based on your selections"
          >
            <span className="text-sm sm:text-base">Create Recipes</span>
            <ChevronRightIcon
              className="w-4 h-4 ml-1 sm:w-5 sm:h-5 sm:ml-2"
              aria-hidden="true"
            />
          </Button>
        </div>


      </div>
    </div>
  );
};

export default ReviewComponent;
