import { useState, useEffect, ReactElement } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import Image from 'next/image';
import {
    XMarkIcon,
    ClipboardDocumentIcon,
    ClipboardIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    InformationCircleIcon,
    PlayCircleIcon,
    StopCircleIcon
} from '@heroicons/react/16/solid'
import DeleteDialog from './DeleteDialog';
import audioload from '../../assets/audioload.gif';
import { ExtendedRecipe } from '../../types';

interface ActionPopoverProps {
    handleClone: () => void
    handleCopy: () => void
    closeDialog?: () => void
    handlePlayRecipe: () => void
    deleteDialog: () => void
    deleteRecipe: () => void
    recipe: ExtendedRecipe
    hasAudio: boolean
    isLoadingAudio: boolean
    isPlayingAudio: boolean
    linkCopied: boolean
    isDeleteDialogOpen: boolean
    buttonType: ReactElement
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
    isLoadingAudio,
    isPlayingAudio,
    linkCopied,
    isDeleteDialogOpen,
    buttonType
}: ActionPopoverProps) {

    const handleOpenRecipe = () => {
        if (!closeDialog) return;
        closeDialog()
        window.open(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/RecipeDetail?recipeId=${recipe._id}`,
            '_blank',
            'noopener,noreferrer'
        )
    }

    const getAudioControls = () => {
        if (isLoadingAudio) {
            return <Image
                src={audioload}
                alt="audio-load-gif"
                width={150}
                height={150}
            />
        }
        return (
            <button
                className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" onClick={() => {
                    handlePlayRecipe()
                }}
            >
                {
                    isPlayingAudio ?
                        <StopCircleIcon className="h-5 w-5 text-red-500" /> :
                        <PlayCircleIcon className={`h-5 w-5 ${hasAudio ? "text-green-500" : "text-blue-500"}`} />
                }

                {isPlayingAudio ? 'Stop Playing' : 'Play Recipe'}
            </button>
        )
    }

    return (
        <>
            <Popover className="relative">
                <PopoverButton className="flex items-center gap-2 focus:outline-none ml-auto">
                    {buttonType}
                </PopoverButton>
                <PopoverPanel className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/10">
                    {({ close }) => (
                        <>
                            <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handleClone}>
                                <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                                Clone Ingredients
                            </button>
                            {closeDialog && <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handleOpenRecipe}>
                                <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-500" />
                                Open Recipe
                            </button>}
                            <button
                                className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={() => {
                                    close()
                                    handleCopy()
                                }}>
                                <ClipboardIcon className="h-5 w-5 text-gray-500" />
                                Copy Link
                            </button>
                            { getAudioControls()}
                            {
                                (closeDialog || recipe.owns) && <div className="my-1 h-px bg-gray-200" />
                            }
                            {closeDialog && <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={closeDialog}>
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                                Close
                            </button>}
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
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded shadow-lg flex items-center bg-blue-500 text-white font-bold 
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