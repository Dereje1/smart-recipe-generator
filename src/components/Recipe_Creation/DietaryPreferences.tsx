import React, { useState, useEffect } from 'react';
import { Checkbox } from '@headlessui/react';
import {
  CheckIcon,
  SparklesIcon,
  CubeIcon,
  FireIcon,
  CakeIcon,
  BoltIcon,
  GlobeAltIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import { DietaryPreference, Recipe } from '../../types/index';

const dietaryOptions: DietaryPreference[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Halal',
  'Kosher'
];

const iconMap: Record<DietaryPreference, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Vegetarian: SparklesIcon,
  Vegan: CubeIcon,
  'Gluten-Free': FireIcon,
  'Dairy-Free': CakeIcon,
  Keto: BoltIcon,
  Halal: GlobeAltIcon,
  Kosher: HeartIcon,
};

const tooltipMap: Record<DietaryPreference, string> = {
  Vegetarian: 'No meat or fish',
  Vegan: 'No animal products',
  'Gluten-Free': 'No wheat, barley or rye',
  'Dairy-Free': 'No milk or dairy products',
  Keto: 'Low-carb, high-fat',
  Halal: 'Halal-certified ingredients',
  Kosher: 'Prepared according to Jewish dietary laws',
};

interface DietaryPreferencesProps {
  preferences: DietaryPreference[];
  updatePreferences: (preferences: DietaryPreference[]) => void;
  generatedRecipes: Recipe[];
}

export default function DietaryPreferences({
  preferences,
  updatePreferences,
  generatedRecipes,
}: DietaryPreferencesProps) {
  const [noPreference, setNoPreference] = useState(false)

  useEffect(() => {
    if (!preferences.length) {
      setNoPreference(true)
    }
  }, [preferences.length])

  const handlePreferenceChange = (checked: boolean, option: DietaryPreference) => {
    const updatedPreferences = preferences.includes(option) ? preferences.filter((p) => p !== option) : [...preferences, option]
    updatePreferences(updatedPreferences)
  };

  const handleNoPreference = () => {
    setNoPreference(!noPreference)
    updatePreferences([])
  }

  return (
    <div
      className="w-full p-4 sm:p-6 bg-white shadow-md rounded-xl animate-fadeInUp"
    >
      {/* Enhanced Title */}
      <h2 className="text-xl font-medium text-gray-800 mb-2 sm:text-2xl">
        Dietary Preferences
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Choose as many preferences as you like—your recipes will match them!
      </p>

      {/* "No Preference" Option */}
      <div className="flex items-center mb-4">
        <Checkbox
          checked={noPreference}
          onChange={handleNoPreference}
          className={`h-5 w-5 rounded border border-gray-300 flex items-center justify-center ${noPreference ? 'bg-brand-600' : 'bg-white'
            } focus:outline-none focus:ring-2 focus:ring-brand-500`}
          disabled={Boolean(generatedRecipes.length)}
          aria-label="No Dietary Preference"
        >
          {noPreference && <CheckIcon className="h-3 w-3 text-white" />}
        </Checkbox>
        <span className="ml-3 text-gray-700">No Preference</span>
      </div>

      <hr className="mb-4" />

      {/* Dietary Options with Wrapped Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {dietaryOptions.map((option) => {
          const Icon = iconMap[option];
          const selected = preferences.includes(option);
          return (
            <div
              key={option}
              title={tooltipMap[option]}
              className={`flex items-center p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${selected ? 'bg-brand-50 border-brand-600' : 'bg-white border-gray-200 hover:bg-gray-50'} ${noPreference || generatedRecipes.length ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
              onClick={() => {
                if (noPreference || generatedRecipes.length) return;
                handlePreferenceChange(!selected, option);
              }}
            >
              <Checkbox
                checked={selected}
                onChange={(e) => handlePreferenceChange(e, option)}
                className={`shrink-0 h-5 w-5 rounded border flex items-center justify-center ${selected ? 'bg-brand-600 border-brand-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors`}
                disabled={noPreference || Boolean(generatedRecipes.length)}
                aria-label={option}
              >
                {selected && <CheckIcon className="h-3 w-3 text-white" />}
              </Checkbox>
              <Icon className="shrink-0 w-4 h-4 text-brand-600 ml-3" aria-hidden="true" />
              <span title={tooltipMap[option]} className="ml-2 text-gray-700">{option}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
