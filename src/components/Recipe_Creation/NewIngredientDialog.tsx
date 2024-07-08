import { useState } from 'react'
import { Description, Dialog, DialogPanel, 
    DialogTitle, DialogBackdrop, 
    Button, Input, Field, Label } from '@headlessui/react'
import clsx from 'clsx'
import { addIngredient } from './call_api'

function NewIngredientDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [ingredientName, setIngredientName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        if (!ingredientName) return;
        const response = await addIngredient(ingredientName)
        console.log(response)
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add New Ingredient
            </Button>
            <Dialog open={isOpen} onClose={() => { }} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/50" />
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 rounded-lg shadow-lg">
                        <DialogTitle className="text-xl font-bold">Add New Ingredient</DialogTitle>
                        <Description className="text-sm text-gray-500">If you cannot find the ingredient you wish to select in the list, use this to enter the details of the new ingredient you wish to add. Our system will validate it before adding it to the database.</Description>
                        <Field className="mb-4">
                            <Label htmlFor="ingredientName" className="block text-sm font-medium text-gray-700">Ingredient Name</Label>
                            <Input
                                type="text"
                                id="ingredientName"
                                name="ingredientName"
                                className={clsx(
                                    'mt-3 block w-full rounded-lg border-none bg-black/5 py-1.5 px-3 text-sm/6 text-black',
                                    'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                                )}
                                value={ingredientName}
                                onChange={(e) => setIngredientName(e.target.value)}
                            />
                        </Field>
                        <div className="flex gap-4">
                            <Button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={handleSubmit}>Submit</Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    )
}

export default NewIngredientDialog;
