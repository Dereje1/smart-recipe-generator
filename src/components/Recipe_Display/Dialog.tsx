import { DialogBackdrop, Dialog, DialogPanel, Button } from '@headlessui/react'
import Image from 'next/image'
import RecipeCard from '../Recipe_Creation/RecipeCard'
import { ExtendedRecipe } from '../../types'

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
            <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
                <DialogBackdrop className="fixed inset-0 bg-black/50" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-md rounded-xl bg-white p-1 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                        >
                            <div className="flex flex-col items-center">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex items-center mb-2 mt-2 ml-2 bg-gray-100 p-2 rounded-lg">
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
                                    <Button className="mr-3 mt-2 bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" onClick={close}>
                                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </Button>
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