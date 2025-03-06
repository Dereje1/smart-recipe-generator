import NotificationsPage, { getServerSideProps } from "../../src/pages/NotificationsPage";
import { fireEvent, render, screen } from '@testing-library/react'
import { stubNotifications } from "../stub";

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    getServerSidePropsUtility: jest.fn(() => Promise.resolve('mock_serverside_props_return')),
    call_api: jest.fn(() => Promise.resolve('mock marked as read'))
}))

jest.mock('next/link', () => {
    return ({ children }: { children: any }) => {
        return children;
    };
});

const routePushMock = jest.fn()

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock
    })),
}))

describe('The home component', () => {
    it('shall render', () => {
        render(<NotificationsPage initialNotifications={stubNotifications} />)
        expect(screen.getByText('Notifications')).toBeInTheDocument()
        expect(screen.getByText('stub_message_1')).toBeInTheDocument()
    })

    it('shall mark a notification as read', async () => {
        render(<NotificationsPage initialNotifications={stubNotifications} />)
        // list item for the notification
        const notification = await screen.getByRole('listitem')
        // Mark as read button
        const markAsRead = await screen.getByText('Mark as Read')
        // The list text should be bold if unread
        expect(notification.className.includes('text-gray-800 font-bold')).toBeTruthy()
        fireEvent.click(markAsRead)
        await screen.findByText('Notifications')
        // The list text should NOT be bold if read
        expect(notification.className.includes('text-gray-800 font-bold')).toBeFalsy()
        expect(notification.className.includes('text-gray-500')).toBeTruthy()
    })
})


describe('updating the serverside props', () => {
    it('shall update', async () => {
        const response = await getServerSideProps('' as any);
        expect(response).toBe('mock_serverside_props_return')
    })
})