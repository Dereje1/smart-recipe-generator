import React, { useState, useEffect } from 'react';
import { Button } from '@headlessui/react';
import {
  PencilIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  CubeIcon,
  FireIcon,
  CakeIcon,
  BoltIcon,
  GlobeAltIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import { Ingredient, DietaryPreference, Recipe } from '../../types/index';
import useWindowSize from '../Hooks/useWindowSize';

const preferenceIconMap: Record<
  DietaryPreference,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  Vegetarian: SparklesIcon,
  Vegan: CubeIcon,
  'Gluten-Free': FireIcon,
  'Dairy-Free': CakeIcon,
  Keto: BoltIcon,
  Halal: GlobeAltIcon,
  Kosher: HeartIcon,
};

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
  const { height } = useWindowSize()
  const showButtons = generatedRecipes.length === 0

  return (
    <div
      className="w-full p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-stone-100 shadow-md rounded-xl animate-fadeInUp overflow-y-auto"
      style={{ maxHeight: height - 160 }}
    >
      <div className="px-1 py-1">
        {/* Enhanced Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-medium text-gray-800 sm:text-3xl">
            {showButtons ? 'Review Your Selections' : 'Submit Your Recipe Choices'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {showButtons
              ? ingredients.length >= 3 ? 'Make sure everything looks right before we start cooking!' : ''
              : "Here's a recap of your choices. Use the switch on each recipe generated to select the recipes you want to submit."}
          </p>
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
            style={{ maxHeight: height <= 800 ? '60px' : '150px' }}
          >
            {ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-center bg-brand-100 text-brand-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                <CheckCircleIcon className="w-4 h-4 mr-1 text-brand-600" aria-hidden="true" />
                {ingredient.name}
                {ingredient.quantity && (
                  <span className="ml-1 text-xs text-brand-600">
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
            {dietaryPreference.map((preference) => {
              const Icon = preferenceIconMap[preference] || SparklesIcon;
              return (
                <span
                  key={preference}
                  className="flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
                >
                  <Icon className="w-4 h-4 mr-1 text-brand-600" aria-hidden="true" />
                  {preference}
                </span>
              );
            })}
          </div>
        </div>

        {showButtons && (
          <div className="flex justify-between mt-8">
            {/* Edit Button */}
            <Button
              onClick={onEdit}
              className={`flex items-center justify-center bg-gray-200 text-gray-700
                px-2 py-2 sm:px-4 sm:py-2
                rounded-full transition duration-300 ease-in-out transform
                hover:bg-gray-300 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500
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
              className={`flex items-center justify-center bg-brand-600 text-white
                px-2 py-2 sm:px-4 sm:py-2
                rounded-full transition duration-300 ease-in-out transform
                hover:bg-brand-700 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500
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
        )}


      </div>
    </div>
  );
};

export default ReviewComponent;
