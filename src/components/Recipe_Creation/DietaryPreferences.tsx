import { useState, useEffect } from 'react';
import { Checkbox, Field, Label } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'
import { DietaryPreference, Recipe } from '../../types/index'


const dietaryOptions: DietaryPreference[] = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];

interface DietaryPreferencesProps {
  preferences: DietaryPreference[]
  updatePreferences: (preferences: DietaryPreference[]) => void
  generatedRecipes: Recipe[]
}

const initialPreference: DietaryPreference[] = [];

export default function DietaryPreferences({ preferences, updatePreferences, generatedRecipes }: DietaryPreferencesProps) {
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
    <div className="mt-2 ml-5 sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 className="text-xl font-bold mb-4">Dietary Preferences</h2>
      <Field className="flex items-center gap-2 mr-5 mb-5 italic" disabled={Boolean(generatedRecipes.length)}>
        <Checkbox
          checked={noPreference}
          onChange={handleNoPreference}
          className="group size-6 rounded-md bg-black/10 p-1 ring-1 ring-black/15 ring-inset data-[checked]:bg-black"
        >
          <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
        </Checkbox>
        <Label className="data-[disabled]:opacity-50">No Preference</Label>
      </Field>
      <hr className="mb-4" />
      <div className="flex flex-wrap">
        {dietaryOptions.map((option) => (
          <Field className="flex items-center gap-2 mr-5 mb-5 data-[disabled]:opacity-50" key={option} disabled={noPreference || Boolean(generatedRecipes.length)}>
            <Checkbox
              checked={preferences.includes(option)}
              onChange={(e) => handlePreferenceChange(e, option)}
              className="group size-6 rounded-md bg-black/10 p-1 ring-1 ring-black/15 ring-inset data-[checked]:bg-black"
            >
              <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
            </Checkbox>
            <Label>{option}</Label>
          </Field>
        ))}
      </div>
    </div>
  );
}