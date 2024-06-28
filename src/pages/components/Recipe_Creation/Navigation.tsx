import { useState } from 'react';
import { Button } from '@headlessui/react'
import IngredientForm from './IngredientForm';
import DietaryPreferences from './DietaryPreferences';
import ReviewComponent from './Review';

const steps = ['Add Ingredients', 'Choose Diet', 'Review']

type ingredient = {
    name: string
    quantity: number
    id: number
}
const initialIngridients: ingredient[] = []
const initialPreferences: string[] = [];

interface StepComponentProps {
    step: number,
    ingredients: ingredient[],
    updateIngredients: (ingredients: ingredient[]) => void
    preferences: string[]
    updatePreferences: (preferences: string[]) => void
    editInputs: () => void
}

function StepComponent({
    step,
    ingredients,
    updateIngredients,
    preferences,
    updatePreferences,
    editInputs
}: StepComponentProps) {
    switch (step) {
        case 0:
            return <IngredientForm ingredients={ingredients} updateIngredients={updateIngredients} />;
        case 1:
            return <DietaryPreferences preferences={preferences} updatePreferences={updatePreferences} />
        case 2:
            return <ReviewComponent ingredients={ingredients} dietaryPreference={preferences} onEdit={editInputs} onSubmit={()=>{}}/>
        default:
            return <h1 className="text-center">Not ready yet!</h1>;
    }

}

export default function Navigation() {
    const [step, setStep] = useState(0);
    const [ingredients, setIngredients] = useState(initialIngridients)
    const [preferences, setPreferences] = useState(initialPreferences)

    const updateStep = (val: number) => {
        let newStep = step + val
        if (newStep < 0 || newStep >= steps.length) newStep = 0
        setStep(newStep)
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
                            disabled={step === steps.length - 1}
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
                updateIngredients={(ingredients: ingredient[]) => setIngredients(ingredients)}
                preferences={preferences}
                updatePreferences={(preferences: string[]) => setPreferences(preferences)}
                editInputs={() => setStep(0)}
            />
        </>
    )
}
