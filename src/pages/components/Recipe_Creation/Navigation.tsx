import { useState } from 'react';
import IngredientForm from './IngredientForm';

const steps = ['Add Ingredients', 'Choose Diet', 'Review Choices']

type ingredient = {
    name: string
    quantity: number
    id: number
}
const initialIngridients: ingredient[] = []

interface StepComponentProps {
    step: number,
    ingredients: ingredient[],
    updateIngredients: (ingredients: ingredient[]) => void
}

function StepComponent({
    step,
    ingredients,
    updateIngredients
}: StepComponentProps) {
    switch (step) {
        case 0:
            return <IngredientForm ingredients={ingredients} updateIngredients={updateIngredients} />;
        default:
            return <h1 className="text-center">Not ready yet!</h1>;
    }

}

export default function Navigation() {
    const [step, setStep] = useState(0);
    const [ingredients, setIngredients] = useState(initialIngridients)

    const updateStep = (val: number) => {
        let newStep = step + val
        if (newStep < 0 || newStep >= steps.length) newStep = 0
        setStep(newStep)
    }
    return (
        <>
            <div className="flex items-center justify-center">
                <div className="w-[400px]  text-white p-4 flex justify-between mt-10">
                    {step !== 0 && <button
                        type="button"
                        className="bg-gray-800 text-white rounded-l-md border-r border-gray-100 py-2 hover:bg-red-700 hover:text-white px-3"
                        onClick={() => updateStep(-1)}
                    >
                        <div className="flex flex-row align-middle">
                            <svg className="w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
                            </svg>
                            <p className="ml-2">Prev</p>
                        </div>
                    </button>}
                    <p className="text-black mt-2 font-bold italic text-lg">{steps[step]}</p>
                    {step !== steps.length - 1 && <button
                        type="button"
                        className="bg-gray-800 text-white rounded-r-md py-2 border-l border-gray-200 hover:bg-red-700 hover:text-white px-3"
                        onClick={() => updateStep(+1)}
                    >
                        <div className="flex flex-row align-middle">
                            <span className="mr-2">Next</span>
                            <svg className="w-5 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                        </div>
                    </button>}
                </div>
            </div>
            <StepComponent
                step={step}
                ingredients={ingredients}
                updateIngredients={(ingredients: ingredient[]) => setIngredients(ingredients)}
            />
        </>
    )
}
