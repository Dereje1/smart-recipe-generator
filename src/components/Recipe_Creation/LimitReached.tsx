import React from 'react';
import { Button } from '@headlessui/react';
import { useRouter } from 'next/router';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'

interface LimitReachedProps {
    message?: string;
    onAction?: () => void;
    actionText?: string;
    fullHeight?: boolean;
}

const LimitReached: React.FC<LimitReachedProps> = ({
    message = "You've reached your recipe creation limit.",
    onAction,
    actionText = "Go to Home",
    fullHeight = false,
}) => {
    const router = useRouter();

    const handleAction = () => {
        if (onAction) {
            onAction();
        } else {
            router.push('/');
        }
    };

    return (
        <div className={`flex flex-col items-center justify-top ${fullHeight ? 'min-h-screen' : 'h-full'} bg-gray-100 p-4`}>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                {/* Icon */}
                <ExclamationCircleIcon className="block m-auto h-16 w-16 text-red-500"/>
                {/* Title */}
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Limit Reached</h2>
                {/* Message */}
                <p className="text-gray-600 mb-6">{message}</p>
                {/* Action Button */}
                <Button
                    onClick={handleAction}
                    className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                    {actionText}
                </Button>
            </div>
        </div>
    );
};

export default LimitReached;
