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
    handlers: {
        handleClone: () => void;
        handleCopy: () => void;
        closeDialog?: () => void;
        handlePlayRecipe: () => void;
        deleteDialog: () => void;
        deleteRecipe: () => void;
    };
    states: {
        hasAudio: boolean;
        isLoadingAudio: boolean;
        isPlayingAudio: boolean;
        linkCopied: boolean;
        isDeleteDialogOpen: boolean;
    };
    data: {
        recipe: ExtendedRecipe;
        buttonType: ReactElement;
    };
}

export function ActionPopover({handlers, states, data}: ActionPopoverProps) {

    const handleOpenRecipe = () => {
        if (!handlers.closeDialog) return;
        handlers.closeDialog()
        window.open(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/RecipeDetail?recipeId=${data.recipe._id}`,
            '_blank',
            'noopener,noreferrer'
        )
    }

    const getAudioControls = () => {
        if (states.isLoadingAudio) {
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
                    handlers.handlePlayRecipe()
                }}
            >
                {
                    states.isPlayingAudio ?
                        <StopCircleIcon className="h-5 w-5 text-red-500" /> :
                        <PlayCircleIcon className={`h-5 w-5 ${states.hasAudio ? "text-green-500" : "text-blue-500"}`} />
                }

                {states.isPlayingAudio ? 'Stop Playing' : 'Play Recipe'}
            </button>
        )
    }

    return (
        <>
            <Popover className="relative">
                <PopoverButton className={`flex items-center justify-center w-12 h-12 ${handlers.closeDialog ? "mt-3 mr-3" : "ml-auto"} bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 active:bg-gray-300 transition-all duration-200`}>
                    {data.buttonType}
                </PopoverButton>
                <PopoverPanel className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/10">
                    {({ close }) => (
                        <>
                            <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handlers.handleClone}>
                                <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                                Clone Ingredients
                            </button>
                            {handlers.closeDialog && <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handleOpenRecipe}>
                                <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-500" />
                                Open Recipe
                            </button>}
                            <button
                                className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={() => {
                                    close()
                                    handlers.handleCopy()
                                }}>
                                <ClipboardIcon className="h-5 w-5 text-gray-500" />
                                Copy Link
                            </button>
                            { getAudioControls()}
                            {
                                (handlers.closeDialog || data.recipe.owns) && <div className="my-1 h-px bg-gray-200" />
                            }
                            {handlers.closeDialog && <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handlers.closeDialog}>
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                                Close
                            </button>}
                            {data.recipe.owns && <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-red-600 hover:bg-red-50 focus:bg-red-50" onClick={handlers.deleteDialog}>
                                <TrashIcon className="h-5 w-5 text-red-500" />
                                Delete Recipe
                            </button>}
                        </>

                    )}
                </PopoverPanel>
            </Popover>
            {states.linkCopied && <Alert message={`${data.recipe.name} copied to clipboard!`} />}
            <DeleteDialog
                isOpen={states.isDeleteDialogOpen}
                recipeName={data.recipe.name}
                closeDialog={handlers.deleteDialog}
                deleteRecipe={() => {
                    handlers.deleteDialog();
                    handlers.deleteRecipe();
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