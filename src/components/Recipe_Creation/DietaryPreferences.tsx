import { useState, useEffect } from 'react';
import { Checkbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { DietaryPreference, Recipe } from '../../types/index';

const dietaryOptions: DietaryPreference[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Keto',
  'Paleo',
];

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
      className="fixed top-36 mt-32 pl-2 left-1/2 transform -translate-x-1/2 px-4 py-6 bg-white shadow-md rounded-xl sm:max-w-md mx-auto"
      style={{ width: '98%' }}
    >
      {/* Enhanced Title */}
      <h2 className="text-xl font-medium text-gray-800 mb-4 sm:text-2xl">
        Dietary Preferences
      </h2>

      {/* "No Preference" Option */}
      <div className="flex items-center mb-4">
        <Checkbox
          checked={noPreference}
          onChange={handleNoPreference}
          className={`h-5 w-5 rounded border border-gray-300 flex items-center justify-center ${noPreference ? 'bg-indigo-600' : 'bg-white'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          disabled={Boolean(generatedRecipes.length)}
          aria-label="No Dietary Preference"
        >
          {noPreference && <CheckIcon className="h-3 w-3 text-white" />}
        </Checkbox>
        <span className="ml-3 text-gray-700">No Preference</span>
      </div>

      <hr className="mb-4" />

      {/* Dietary Options with Wrapped Layout */}
      <div className="flex flex-wrap gap-3">
        {dietaryOptions.map((option) => (
          <div key={option} className="flex items-center">
            <Checkbox
              checked={preferences.includes(option)}
              onChange={(e) => handlePreferenceChange(e, option)}
              className={`h-5 w-5 rounded border border-gray-300 flex items-center justify-center ${preferences.includes(option) ? 'bg-indigo-600' : 'bg-white'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={noPreference || Boolean(generatedRecipes.length)}
              aria-label={option}
            >
              {preferences.includes(option) && (
                <CheckIcon className="h-3 w-3 text-white" />
              )}
            </Checkbox>
            <span className="ml-3 text-gray-700">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
