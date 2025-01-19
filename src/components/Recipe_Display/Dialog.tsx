import { useEffect } from 'react';
import { DialogBackdrop, Dialog, DialogPanel } from '@headlessui/react';
import Image from 'next/image';
import useActionPopover from '../Hooks/useActionPopover';
import RecipeCard from '../Recipe_Creation/RecipeCard';
import DeleteDialog from './DeleteDialog';
import Loading from '../Loading';
import { ActionPopover } from './ActionPopover';
import { formatDate } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

interface RecipeDialogProps {
    isOpen: boolean;
    close: () => void;
    recipe: ExtendedRecipe | null;
    deleteRecipe: () => void;
}

export default function RecipeDisplayModal({ isOpen, close, recipe, deleteRecipe }: RecipeDialogProps) {
    const {
        handleClone,
        handleCopy,
        handlePlayRecipe,
        killAudio,
        handleDeleteDialog,
        linkCopied,
        disableAudio,
        isLoadingAudio,
        isDeleteDialogOpen
    } = useActionPopover(recipe);

    useEffect(() => {
        // Stop audio playback when the modal is closed
        if (!isOpen) {
            killAudio()
        }
    }, [isOpen, killAudio]);


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
                                    !isLoadingAudio && <div className="flex justify-between items-start w-full">
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
                                            handleClone={handleClone}
                                            handleCopy={handleCopy}
                                            closeDialog={close}
                                            deleteDialog={recipe.owns ? handleDeleteDialog : undefined}
                                            recipe={recipe}
                                            handlePlayRecipe={handlePlayRecipe}
                                            hasAudio={Boolean(recipe.audio)}
                                            disableAudio={disableAudio}
                                            linkCopied={linkCopied}
                                        />
                                    </div>
                                }
                                {
                                    isLoadingAudio ?
                                        <Loading />
                                        :
                                        <RecipeCard recipe={recipe} selectedRecipes={[]} removeMargin />
                                }
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                recipeName={recipe.name}
                closeDialog={handleDeleteDialog}
                deleteRecipe={() => {
                    handleDeleteDialog();
                    deleteRecipe();
                }}
            />
        </>
    );
}
