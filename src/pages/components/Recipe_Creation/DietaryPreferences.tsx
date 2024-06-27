import { useState, useEffect } from 'react';
import { Checkbox, Field, Label } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'


const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];


interface DietaryPreferences {
  preferences: string[]
  updatePreferences: (preferences: string[]) => void
}

const initialPreference: string[] = [];

export default function DietaryPreferences({ preferences, updatePreferences }: DietaryPreferences) {
  const [noPreference, setNoPreference] = useState(false)

  useEffect(() => {
    if (!preferences.length) {
      setNoPreference(true)
    }
  }, [preferences.length])

  const handlePreferenceChange = (checked: boolean, option: string) => {
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
      <Field className="flex items-center gap-2 mr-5 mb-5 italic">
        <Checkbox
          checked={noPreference}
          onChange={handleNoPreference}
          className="group size-6 rounded-md bg-black/10 p-1 ring-1 ring-black/15 ring-inset data-[checked]:bg-black"
        >
          <CheckIcon className="hidden size-4 fill-white group-data-[checked]:block" />
        </Checkbox>
        <Label className="data-[disabled]:opacity-50">No Preference</Label>
      </Field>
      <hr className="mb-4"/>
      <div className="flex flex-wrap">
        {dietaryOptions.map((option) => (
          <Field className="flex items-center gap-2 mr-5 mb-5 data-[disabled]:opacity-50" key={option} disabled={noPreference}>
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