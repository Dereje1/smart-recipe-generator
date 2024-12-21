import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { call_api } from '../utils/utils';
import { NotificationType } from '../types';

interface NotificationProps {
    screen?: string;
}

const Notifications = ({ screen }: NotificationProps) => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <Popover className="relative">
            <PopoverButton
                className={`relative rounded-full bg-green-800 p-1 text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-800 ${screen === 'mobile' ? 'ml-auto' : ''
                    }`}
            >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
            </PopoverButton>
            <PopoverPanel
                className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black/10 z-50"
            >
                <div className="p-4">
                    {loading && <p className="text-sm text-gray-500">Loading notifications...</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {!loading && !error && notifications.length > 0 && (
                        <ul className="divide-y divide-gray-200">
                            {notifications.map((notification, index: number) => (
                                <li
                                    key={index}
                                    className="py-3 px-2 flex items-start hover:bg-gray-100 rounded-md"
                                >
                                    <div className="text-sm text-gray-800">
                                        {notification.message}
                                    </div>
                                </li>
                            ))}
                        </ul>
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
