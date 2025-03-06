/**
 * @jest-environment node
 */
import readNotifications from '../../../src/pages/api/read-notification';
import Notification from '../../../src/models/notification';
import { mockRequestResponse } from '../../apiMocks';
import { stubNotifications, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

// mock authOptions 
jest.mock("../../../src/pages/api/auth/[...nextauth]", () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));
//use to mock gets session
jest.mock("next-auth/next");
// mock db connection
jest.mock('../../../src/lib/mongodb', () => ({
    connectDB: () => Promise.resolve()
}))

describe('Reading Notifications', () => {
    let getServerSessionSpy: any
    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('shall reject requests that do not use the PUT method', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('POST')
        await readNotifications(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Method POST Not Allowed' }))
        expect(res._getHeaders()).toEqual({ allow: ['PUT'], 'content-type': 'application/json' })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('PUT')
        await readNotifications(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
    })

    it('shall not proceed if the query is not in the request', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('PUT')
        await readNotifications(req, res)
        expect(res.statusCode).toBe(400)
        expect(res._getJSONData()).toEqual({ error: 'Invalid notification ID' })
    })

    it('shall not proceed if the updated notification is not returned', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Notification.findOneAndUpdate = jest.fn().mockImplementation(() => null);
        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            query: {
                id: 'mock_id'
            },
        }
        await readNotifications(updatedreq, res)
        expect(res.statusCode).toBe(404)
        expect(res._getJSONData()).toEqual({ error: 'Notification not found' })
    })

    it('shall return the updated notification', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Notification.findOneAndUpdate = jest.fn().mockImplementation(
            () => ({
                ...stubNotifications[0],
                read: true
            }),
        );
        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            query: {
                id: 'mock_id'
            },
        }
        await readNotifications(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual({
            ...stubNotifications[0],
            read: true
        })
    })

    it('will respond with error if PUT is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Notification.findOneAndUpdate = jest.fn().mockRejectedValue(
            () => ((new Error('Mocked rejection')))
        );
        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            query: {
                id: 'mock_id'
            },
        }
        await readNotifications(updatedreq, res);
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to mark notification as read' })
    })

});