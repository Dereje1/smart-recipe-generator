import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import for navigation
import { BellIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'; // Additional icons
import { CheckIcon } from '@heroicons/react/24/solid';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import useWindowSize from './Hooks/useWindowSize';
import { call_api } from '../utils/utils';
import { NotificationType } from '../types';

interface NotificationProps {
    screen?: string;
}

const Notifications = ({ screen }: NotificationProps) => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter(); // Router for navigation
    const { height } = useWindowSize();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await call_api({ address: '/api/get-notifications' });
                setNotifications(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Count unread notifications
    const unreadCount = notifications.filter((notification) => !notification.read).length;

    const markAsRead = async (id: string) => {
        try {
            await call_api({ address: `/api/read-notification?id=${id}`, method: 'put' });

            // Update the local state after marking as read
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification._id === id ? { ...notification, read: true } : notification
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Get the latest 5 notifications
    const latestNotifications = notifications.slice(0, 5);

    return (
        <Popover className="relative">
            <PopoverButton
                className={`relative rounded-full bg-brand-800 p-1 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-800 ${screen === 'mobile' ? 'ml-auto' : ''
                    }`}
            >
                {/* Bell Icon */}
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />

                {/* Badge for unread notifications */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                        {unreadCount}
                    </span>
                )}
            </PopoverButton>
            <PopoverPanel
                className={`${height <= 750 ? 'absolute right-8 top-0 -mt-32' : 'absolute right-0 mt-2'} w-80 rounded-lg bg-white shadow-lg ring-1 ring-black/10 z-header`}
            >
                <div className="p-4">
                    {loading && <p className="text-sm text-gray-500">Loading notifications...</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {!loading && !error && latestNotifications.length > 0 && (
                        <ul className="divide-y divide-gray-200">
                            {latestNotifications.map(({ _id, read, message, recipeId }) => (
                                <li
                                    key={_id}
                                    className={`py-3 px-2 flex items-start space-x-3 rounded-md hover:bg-gray-100 ${read ? 'text-gray-500' : 'text-gray-800 font-bold'
                                        }`}
                                >
                                    {/* Icon for read/unread */}
                                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8">
                                        {read ? (
                                            <CheckIcon className="h-5 w-5 text-brand-500" />
                                        ) : (
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{message}</p>
                                        <div className="flex space-x-2 mt-1">
                                            {!read && (
                                                <button
                                                    className="text-xs text-brand-500 hover:underline"
                                                    onClick={() => markAsRead(_id)}
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                            <button
                                                className="text-xs text-brand-500 hover:underline"
                                                onClick={() => router.push(`/RecipeDetail?recipeId=${recipeId}`)}
                                            >
                                                View Recipe
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {notifications.length > 5 && (
                        <button
                            className="mt-4 w-full text-sm text-brand-500 hover:text-brand-700"
                            onClick={() => router.push('/NotificationsPage')}
                        >
                            See All Notifications
                        </button>
                    )}
                    {!loading && !error && notifications.length === 0 && (
                        <p className="text-sm text-gray-500">You have no notifications.</p>
                    )}
                </div>
            </PopoverPanel>

        </Popover>
    );
};

export default Notifications;
