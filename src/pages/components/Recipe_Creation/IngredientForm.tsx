import { ChangeEvent, useState } from 'react';

type ingredient = {
    name: string
    quantity: number
    id: number
}
const initialIngridient: ingredient = { name: '', quantity: 0, id: 0 }
const initialIngridients: ingredient[] = []

const Chip = ({ ingredient, onDelete }: { ingredient: ingredient, onDelete: (id: number) => void }) => {
    return (
        <div className="flex flex-wrap justify-center">
            <div className="flex justify-center items-center m-1 font-medium py-1 px-2 rounded-full text-black-100 bg-gray-200 border border-gray-700 ">
                <div className="text-xs font-bold leading-none max-w-full flex-initial">{`${ingredient.name}${ingredient.quantity > 0 ? ` (${ingredient.quantity})` : ''}`}</div>
                <div className="flex flex-auto flex-row-reverse">
                    <div onClick={() => onDelete(ingredient.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" className="feather feather-x cursor-pointer hover:text-indigo-400 rounded-full w-4 h-4 ml-2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function IngredientForm() {
    const [ingredients, setIngredients] = useState(initialIngridients);
    const [ingredient, setIngredient] = useState(initialIngridient);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setIngredient(
            {
                ...ingredient,
                [name]: value,
            }
        );
    };

    const handleAddIngredient = (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if(!ingredient.name.trim()) return;
        setIngredients([...ingredients, { ...ingredient, id: Date.now() }])
    };

    const deleteIngredient = (id: number) => {
        setIngredients(ingredients.filter(ingredient => ingredient.id !== id))
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="POST">
                        <div>
                            <label htmlFor="text" className="block text-sm font-medium leading-6 text-gray-900">
                                Ingredient
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ingredient"
                                    value={ingredient.name}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="number" className="block text-sm font-medium leading-6 text-gray-900">
                                    Quantity
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={ingredient.quantity}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                onClick={(e) => handleAddIngredient(e)}
                            >
                                Add Ingredient
                            </button>
                        </div>
                    </form>
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
