import { DialogBackdrop, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import Image from 'next/image'
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

export default function RecipeDisplayModal({ isOpen, close, recipe }: RecipeDialogProps) {

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
                                <div className="flex items-center mb-2 mt-2 bg-gray-100 p-2 rounded-lg">
                                    <Image
                                        className="h-10 w-10 rounded-full"
                                        src={recipe.owner.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                        alt={`Profile-Picture-${recipe.owner.name}`}
                                        width={25}
                                        height={25}
                                    />
                                    <div className="ml-4">
                                        <p className="text-lg font-semibold text-gray-900">{recipe.owner.name}</p>
                                        <p className="text-sm text-gray-500">{formatDate(recipe.createdAt)}</p>
                                    </div>
                                </div>
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