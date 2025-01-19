import { useState, useEffect } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import {
    XMarkIcon,
    ClipboardDocumentIcon,
    ClipboardIcon,
    TrashIcon,
    EllipsisVerticalIcon,
    ArrowTopRightOnSquareIcon,
    InformationCircleIcon,
    PlayCircleIcon
} from '@heroicons/react/16/solid'
import DeleteDialog from './DeleteDialog';
import { ExtendedRecipe } from '../../types';

interface ActionPopoverProps {
    handleClone: () => void
    handleCopy: () => void
    closeDialog: () => void
    handlePlayRecipe: () => void
    deleteDialog: () => void
    deleteRecipe: () => void
    recipe: ExtendedRecipe
    hasAudio: boolean
    disableAudio: boolean
    linkCopied: boolean
    isDeleteDialogOpen: boolean
}

export function ActionPopover({
    handleClone,
    handleCopy,
    closeDialog,
    deleteDialog,
    handlePlayRecipe,
    deleteRecipe,
    recipe,
    hasAudio,
    disableAudio,
    linkCopied,
    isDeleteDialogOpen
}: ActionPopoverProps) {

    const handleOpenRecipe = () => {
        closeDialog()
        window.open(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/RecipeDetail?recipeId=${recipe._id}`,
            '_blank',
            'noopener,noreferrer'
        )
    }

    return (
        <>
            <Popover className="relative">
                <PopoverButton className="flex items-center gap-2">
                    <EllipsisVerticalIcon className="h-7 w-7 text-gray-700 mt-6 mr-2" />
                </PopoverButton>
                <PopoverPanel className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/10">
                    {({ close }) => (
                        <>
                            <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handleClone}>
                                <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                                Clone Ingredients
                            </button>
                            <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handleOpenRecipe}>
                                <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-500" />
                                Open Recipe
                            </button>
                            <button
                                className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={() => {
                                    close()
                                    handleCopy()
                                }}>
                                <ClipboardIcon className="h-5 w-5 text-gray-500" />
                                Copy Link
                            </button>
                            <button
                                className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" onClick={() => {
                                    close()
                                    handlePlayRecipe()
                                }}
                                disabled={disableAudio}
                            >
                                <PlayCircleIcon className={`h-5 w-5 ${hasAudio ? "text-green-500" : "text-red-500"}`} />
                                Play Recipe
                            </button>
                            <div className="my-1 h-px bg-gray-200" />
                            <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={closeDialog}>
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                                Close
                            </button>
                            {recipe.owns && <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-red-600 hover:bg-red-50 focus:bg-red-50" onClick={deleteDialog}>
                                <TrashIcon className="h-5 w-5 text-red-500" />
                                Delete Recipe
                            </button>}
                        </>

                    )}
                </PopoverPanel>
            </Popover>
            {linkCopied && <Alert message={`${recipe.name} copied to clipboard!`} />}
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                recipeName={recipe.name}
                closeDialog={deleteDialog}
                deleteRecipe={() => {
                    deleteDialog();
                    deleteRecipe();
                }}
            />
        </>

    )
}

export const Alert = ({ message }: { message: string }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true); // Trigger enter animation
        const timer = setTimeout(() => setVisible(false), 2000); // Start exit animation after 2 seconds
        return () => clearTimeout(timer); // Clean up timeout on unmount
    }, []);

    return (
        <div
            className={`fixed top-20 w-full left-1/2 transform -translate-x-1/2 px-4 py-3 rounded shadow-lg flex items-center bg-blue-500 text-white font-bold 
    ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} 
    transition-all duration-300 ease-out`}
            style={{ zIndex: 100 }}
            role="alert"
        >
            <InformationCircleIcon className="w-6 h-6 flex-shrink-0 mr-2" />
            <p className="text-base sm:text-sm md:text-xs leading-tight">{message}</p>
        </div>
    );
};