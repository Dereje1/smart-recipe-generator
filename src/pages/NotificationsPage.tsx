import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { NotificationType } from '../types';
import { call_api, getServerSidePropsUtility } from '../utils/utils';

interface NotificationsPageProps {
    initialNotifications: NotificationType[];
}

const NotificationsPage = ({ initialNotifications }: NotificationsPageProps) => {
    const [notifications, setNotifications] = useState<NotificationType[]>(initialNotifications);

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

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">You have no notifications.</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                        <li
                            key={notification._id}
                            className={`py-3 px-2 flex items-center space-x-3 rounded-md hover:bg-gray-100 cursor-pointer ${
                                notification.read ? 'text-gray-500' : 'text-gray-800 font-bold'
                            }`}
                            onClick={() =>
                                notification.read ? undefined : markAsRead(notification._id)
                            }
                        >
                            {/* Icon for read/unread */}
                            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10">
                                {notification.read ? (
                                    <CheckIcon className="h-6 w-6 text-green-500" />
                                ) : (
                                    <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                                )}
                            </div>
                            <span className="text-sm flex-1">{notification.message}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/get-notifications', 'initialNotifications');
};

export default NotificationsPage;
