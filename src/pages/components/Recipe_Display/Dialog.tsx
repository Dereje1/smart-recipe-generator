import { DialogBackdrop, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import RecipeCard from '../Recipe_Creation/RecipeCard'
import { ExtendedRecipe } from '../../../types'

interface RecipeDialogProps {
    isOpen: boolean
    close: () => void
    recipe: ExtendedRecipe | null
}

const formatDate = (date: string) => {
    const [, day, mth, year] = new Date(date).toUTCString().split(' ');
    return `${day} ${mth} ${year}`;
};

const formatOwner = (recipe: ExtendedRecipe) => `Created by: ${recipe.owner.name} - ${formatDate(recipe.createdAt)}`

export default function MyModal({ isOpen, close, recipe }: RecipeDialogProps) {

    if (!recipe) return null
    return (
        <>
            <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
                <DialogBackdrop className="fixed inset-0 bg-black/50" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-md rounded-xl bg-white p-1 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                        >
                            <div className="flex flex-col items-center">
                                <span className="bg-blue-100 text-purple-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded mt-1">{formatOwner(recipe)}</span>
                                <RecipeCard
                                    recipe={recipe}
                                    selectedRecipes={[]}
                                    removeMargin
                                />
                            </div>

                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}