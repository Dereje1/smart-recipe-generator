import { ChangeEvent, useState } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import ingredientList from './ingredientList';


type ingredient = {
    name: string
    quantity: number
    id: number
}
type comboIngredient = { id: number, name: string }

const initialIngridient: ingredient = { name: '', quantity: 0, id: 0 }
const initialIngridients: ingredient[] = []
const initialComboIngredient: comboIngredient = { id: 0, name: '' }

const Chip = ({ ingredient, onDelete }: { ingredient: ingredient, onDelete: (id: number) => void }) => {
    return (
        <div className="flex flex-wrap justify-center">
            <div className="flex justify-center items-center m-1 font-medium py-1 px-2 rounded-full text-black-100 bg-gray-200 border border-gray-700 ">
                <div className="text-xs font-bold leading-none max-w-full flex-initial">{`${ingredient.name}${ingredient.quantity > 0 ? ` (${ingredient.quantity})` : ''}`}</div>
                <div className="flex flex-auto flex-row-reverse">
                    <div onClick={() => onDelete(ingredient.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x cursor-pointer hover:text-indigo-400 rounded-full w-4 h-4 ml-2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}


function IngredientList({ ingredientUpdate }: { ingredientUpdate: (val: string | undefined) => void }) {
    const [selectedIngredient, setSelectedIngredient] = useState(initialComboIngredient)
    const [query, setQuery] = useState('')

    const filteredIngredients: comboIngredient[] =
        query === ''
            ? ingredientList
            : ingredientList.filter((ingredient) => {
                return ingredient.name.toLowerCase().includes(query.toLowerCase())
            })

    const handleSelectedIngredient = (ingredient: comboIngredient) => {
        setSelectedIngredient(ingredient);
        ingredientUpdate(ingredient?.name)
    }
    return (
        <div className="mx-auto w-full pt-20">
            <Combobox
                value={selectedIngredient}
                onChange={handleSelectedIngredient}
                onClose={() => setQuery('')}
                immediate
            >
                <div className="relative">
                    <ComboboxInput
                        className={clsx(
                            'w-full rounded-lg border border-gray/20  bg-white py-1.5 pr-8 pl-3 text-sm/6 text-gray-900',
                            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                        )}
                        displayValue={(ingredient: comboIngredient) => ingredient?.name}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder='Choose Ingredient'
                    />
                    <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                        <ChevronDownIcon className="size-4 fill-black/60 group-data-[hover]:fill-black" />
                    </ComboboxButton>
                </div>

                <ComboboxOptions
                    anchor="bottom"
                    transition
                    className={clsx(
                        'w-[var(--input-width)] rounded-xl border border-gray bg-white/100 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
                        'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                    )}
                >
                    {filteredIngredients.map((ingredient) => (
                        <ComboboxOption
                            key={ingredient.id}
                            value={ingredient}
                            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-black/10"
                        >
                            <CheckIcon className="invisible size-4 fill-black group-data-[selected]:visible" />
                            <div className="text-sm/6 text-gray-900">{ingredient.name}</div>
                        </ComboboxOption>
                    ))}
                </ComboboxOptions>
            </Combobox>
        </div>
    )
}

interface IngredientFormProps {
    ingredients: ingredient[],
    updateIngredients: (ingredients: ingredient[]) => void
}

export default function IngredientForm({
    ingredients,
    updateIngredients
}:IngredientFormProps) {
    const [ingredient, setIngredient] = useState(initialIngridient);

    const handleChange = (val: string | undefined, field: string) => {
        if (!val) return;
        setIngredient(
            {
                ...ingredient,
                [field]: val,
            }
        );
    }

    const handleAddIngredient = (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (!ingredient.name.trim()) return;
        const isRepeat = ingredients.map(i => i.name).includes(ingredient.name);
        if (isRepeat) return;
        updateIngredients([...ingredients, { ...ingredient, id: Date.now() }])
    };

    const deleteIngredient = (id: number) => {
        updateIngredients(ingredients.filter(ingredient => ingredient.id !== id))
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="POST">
                        <IngredientList ingredientUpdate={(val) => handleChange(val, 'name')} />
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="number" className="block text-sm font-medium leading-6 text-gray-900">
                                    Quantity (optional)
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={ingredient.quantity}
                                    onChange={(e) => handleChange(e.target.value, 'quantity')}
                                    className="block w-full rounded-md border-0 pl-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                onClick={(e) => handleAddIngredient(e)}
                            >
                                Add Ingredient
                            </button>
                        </div>
                    </form>
                    <br />
                    <div className="flex flex-wrap justify-center mt-2">
                        {
                            ingredients.map(((ingredient: ingredient) =>
                                <Chip
                                    ingredient={ingredient}
                                    key={ingredient.id}
                                    onDelete={(id: number) => deleteIngredient(id)}
                                />
                            ))
                        }
                    </div>

                </div>
            </div>
        </>
    )
}
