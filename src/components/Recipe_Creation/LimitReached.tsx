import React from 'react';
import { Button } from '@headlessui/react';
import { useRouter } from 'next/router';

interface LimitReachedProps {
    message?: string;
    onAction?: () => void;
    actionText?: string;
}

const LimitReached: React.FC<LimitReachedProps> = ({
    message = "You've reached your recipe creation limit.",
    onAction,
    actionText = "Go to Home",
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                {/* Icon */}
                <svg
                    className="w-16 h-16 text-red-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                {/* Title */}
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Limit Reached</h2>
                {/* Message */}
                <p className="text-gray-600 mb-6">{message}</p>
                {/* Action Button */}
                <Button
                    onClick={handleAction}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    {actionText}
                </Button>
            </div>
        </div>
    );
};

export default LimitReached;
