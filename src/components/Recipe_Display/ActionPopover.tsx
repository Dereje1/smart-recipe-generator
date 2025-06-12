import { useState, useEffect, ReactElement } from 'react';
import { createPortal } from 'react-dom';
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
    StopCircleIcon,
} from '@heroicons/react/16/solid'
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline'
import DeleteDialog from './DeleteDialog';
import { useRouter } from 'next/router';
import audioload from '../../assets/audioload.gif';
import audioGenerate from '../../assets/audiogenerate.gif'
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

export function ActionPopover({ handlers, states, data }: ActionPopoverProps) {

    const router = useRouter();

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
                src={states.hasAudio ? audioload : audioGenerate}
                alt="audio-load-gif"
                width={220}
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
                        <PlayCircleIcon className={`h-5 w-5 ${states.hasAudio ? 'text-brand-600' : 'text-brand-400'}`} />
                }

                {states.isPlayingAudio ? 'Stop Playing' : `${states.hasAudio ? 'Play Recipe' : 'Generate Audio'}`}
            </button>
        )
    }

    return (
        <>
            <Popover className="relative">
                <PopoverButton className={`flex items-center justify-center w-12 h-12 ${handlers.closeDialog ? "mt-3 mr-3" : "ml-auto"} bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 active:bg-gray-300 transition-all duration-200`}>
                    {data.buttonType}
                </PopoverButton>
                <PopoverPanel className="absolute right-0 z-header mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/10">
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
                            <button
                                className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={() => router.push(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ChatAssistant?recipeId=${data.recipe._id}`)}>
                                <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-gray-500" />
                                Chat with Assistant
                            </button>
                            {getAudioControls()}
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
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const alertContent = (
        <div
            className={`fixed top-0 inset-x-0 mx-auto mt-5 px-4 py-3 rounded shadow-lg flex items-center bg-brand-100 text-brand-900 font-bold
      w-[95%] sm:w-full max-w-sm sm:max-w-md md:max-w-lg
      ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
      transition-all duration-300 ease-out z-modal`}
            role="alert"
            aria-live="assertive"
        >
            <InformationCircleIcon className="w-6 h-6 flex-shrink-0 mr-2 text-brand-700" />
            <p className="text-sm sm:text-xs md:text-[12px] leading-tight">{message}</p>
        </div>
    );

    if (typeof window === 'undefined') return null;

    return createPortal(alertContent, document.getElementById('alert-root')!);
};
