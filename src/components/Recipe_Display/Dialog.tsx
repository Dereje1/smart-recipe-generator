import { useEffect, useState } from 'react';
import { DialogBackdrop, Dialog, DialogPanel } from '@headlessui/react';
import Image from 'next/image';
import { EllipsisVerticalIcon } from '@heroicons/react/16/solid'
import useActionPopover from '../Hooks/useActionPopover';
import RecipeCard from '../Recipe_Creation/RecipeCard';
import Loading from '../Loading';
import { ActionPopover } from './ActionPopover';
import { formatDate } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

interface RecipeDialogProps {
    isOpen: boolean;
    close: () => void;
    recipe: ExtendedRecipe | null;
    removeRecipe: ({ message, error }: { message: string, error: string }) => void;
}

export default function RecipeDisplayModal({ isOpen, close, recipe, removeRecipe }: RecipeDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const {
        handleClone,
        handleCopy,
        handlePlayRecipe,
        killAudio,
        handleDeleteDialog,
        handleDeleteRecipe,
        linkCopied,
        isPlayingAudio,
        isLoadingAudio,
        isDeleteDialogOpen
    } = useActionPopover(recipe);

    useEffect(() => {
        // Stop audio playback when the modal is closed
        if (!isOpen) {
            killAudio()
        }
    }, [isOpen, killAudio]);

    const deleteAndRemoveRecipe = async () => {
        try {
            setIsLoading(true)
            const { message, error } = await handleDeleteRecipe();
            setIsLoading(false)
            removeRecipe({ message, error })
        } catch (error) {
            console.error(error)
        }
    }

    if (!recipe) return null;

    return (
        <>
            <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
                <DialogBackdrop className="fixed inset-0 bg-black/50" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            transition
                            className="w-full max-w-md rounded-xl bg-white p-1 backdrop-blur-2xl duration-300 ease-out"
                        >
                            <div className="flex flex-col items-center">
                                {
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center mb-2 mt-2 ml-2 bg-gray-100 p-2 rounded-lg">
                                            <Image
                                                className="h-10 w-10 rounded-full"
                                                src={
                                                    recipe.owner.image ||
                                                    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                                                }
                                                alt={`Profile-Picture-${recipe.owner.name}`}
                                                width={25}
                                                height={25}
                                            />
                                            <div className="ml-4">
                                                <p className="text-lg font-semibold text-gray-900">{recipe.owner.name}</p>
                                                <p className="text-sm text-gray-500">{formatDate(recipe.createdAt)}</p>
                                            </div>
                                        </div>
                                        <ActionPopover
                                            handlers={{
                                                handleClone,
                                                handleCopy,
                                                closeDialog: close,
                                                handlePlayRecipe,
                                                deleteDialog: handleDeleteDialog,
                                                deleteRecipe: deleteAndRemoveRecipe,
                                            }}
                                            states={{
                                                hasAudio: Boolean(recipe.audio),
                                                isLoadingAudio,
                                                isPlayingAudio,
                                                linkCopied,
                                                isDeleteDialogOpen,
                                            }}
                                            data={{
                                                recipe,
                                                buttonType: <EllipsisVerticalIcon className="h-7 w-7 text-gray-700 mt-6 mr-2" />,
                                            }}

                                        />
                                    </div>
                                }
                                {
                                    isLoading ?
                                        <Loading />
                                        :
                                        <RecipeCard recipe={recipe} selectedRecipes={[]} removeMargin />
                                }
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
