import { useState, useEffect } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import {
    XMarkIcon,
    ClipboardDocumentIcon,
    ClipboardIcon,
    TrashIcon,
} from '@heroicons/react/16/solid'

interface ActionPopoverProps {
    handleClone: () => void
    handleCopy: () => void
    closeDialog: () => void
    deleteDialog?: () => void | undefined
}

export function ActionPopover({
    handleClone,
    handleCopy,
    closeDialog,
    deleteDialog
}: ActionPopoverProps) {
    return (
        <Popover className="relative">
            <PopoverButton className="flex items-center gap-2">
                <EllipsisVerticalIcon className="h-7 w-7 text-gray-700 mt-6 mr-2" />
            </PopoverButton>
            <PopoverPanel className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/10">
                <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handleClone}>
                    <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
                    Clone Ingredients
                </button>
                <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={handleCopy}>
                    <ClipboardIcon className="h-5 w-5 text-gray-500" />
                    Copy Link
                </button>
                <div className="my-1 h-px bg-gray-200" />
                <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-100 focus:bg-gray-100" onClick={closeDialog}>
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                    Close
                </button>
                {deleteDialog && <button className="group flex w-full items-center gap-2 rounded-lg py-2 px-4 text-red-600 hover:bg-red-50 focus:bg-red-50" onClick={deleteDialog}>
                    <TrashIcon className="h-5 w-5 text-red-500" />
                    Delete Recipe
                </button>}
            </PopoverPanel>
        </Popover>
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
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded shadow-lg flex items-center bg-blue-500 text-white text-sm font-bold 
            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} 
            transition-all duration-300 ease-out`}
            style={{ zIndex: 100 }}
            role="alert"
        >
            <svg
                className="fill-current w-4 h-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
            >
                <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
            </svg>
            <p>{message}</p>
        </div>
    );
};