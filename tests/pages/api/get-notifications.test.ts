/**
 * @jest-environment node
 */
import getNotifications from '../../../src/pages/api/get-notifications';
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

describe('Getting Notifications', () => {
    let getServerSessionSpy: any
    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('shall reject requests that do not use the GET method', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('POST')
        await getNotifications(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Method POST Not Allowed' }))
        expect(res._getHeaders()).toEqual({ allow: ['GET'], 'content-type': 'application/json' })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse()
        await getNotifications(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
    })

    it('shall return the notifications for the logged in user', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Notification.find = jest.fn().mockImplementation(
            () => ({
                sort: jest.fn().mockImplementation(() => ({
                    lean: jest.fn().mockImplementation(() => ({
                        exec: jest.fn().mockResolvedValue(stubNotifications),
                    }))
                })),
            }),
        );
        const { req, res } = mockRequestResponse()
        await getNotifications(req, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubNotifications)
    })
    it('will respond with error if GET is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Notification.find = jest.fn().mockImplementation(
            () => ({
                populate: jest.fn().mockImplementation(() => ({
                    lean: jest.fn().mockImplementation(() => ({
                        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
                    }))
                })),
            }),
        );
        const { req, res } = mockRequestResponse()
        await getNotifications(req, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to fetch notifications' })
    })

});