/**
 * @jest-environment jsdom
 */
import UserActivityPage from "../../src/pages/UserActivity";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as apiCalls from "../../src/utils/utils";
import { stubRecipeBatch } from "../stub";

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    call_api: jest.fn()
}));

const routerMock = {
    query: { userId: '507f1f77bcf86cd799439011' },
    push: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn()
    }
  };
  
  jest.mock('next/router', () => ({
    useRouter: () => routerMock,
  }));
  

describe('The User Activity Page', () => {
    let getUserActivityAPI: any;

    beforeEach(() => {
        getUserActivityAPI = jest.spyOn(apiCalls, 'call_api');
        getUserActivityAPI.mockResolvedValue({
            user: {
                name: 'John Doe',
                image: 'https://example.com/avatar.jpg',
                joinedDate: new Date().toISOString()
            },
            createdRecipes: stubRecipeBatch,
            likedRecipes: stubRecipeBatch
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('shall render user info', async () => {
        render(<UserActivityPage />);
        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(await screen.findByText(/Joined/)).toBeInTheDocument();
    });

    it('shall display created recipes by default', async () => {
        render(<UserActivityPage />);
        expect(await screen.findByText('Recipe_1_name')).toBeInTheDocument();
    });

    it('shall switch to liked recipes on tab click', async () => {
        render(<UserActivityPage />);
        const likedTab = await screen.findByText('Liked Recipes');
        fireEvent.click(likedTab);
        expect(await screen.findByText('Recipe_1_name')).toBeInTheDocument(); // same stub for likedRecipes
    });
    

    it('shall display empty states if no recipes', async () => {
        getUserActivityAPI.mockClear();
        getUserActivityAPI.mockResolvedValueOnce({
            user: {
                name: 'John Doe',
                image: 'https://example.com/avatar.jpg',
                joinedDate: new Date().toISOString()
            },
            createdRecipes: [],
            likedRecipes: []
        });

        render(<UserActivityPage />);
        expect(await screen.findByText('No recipes created yet.')).toBeInTheDocument();
        const likedTab = await screen.findByText('Liked Recipes');
        fireEvent.click(likedTab);
        expect(await screen.findByText('No liked recipes yet.')).toBeInTheDocument();
    });

    it('shall show error if fetch fails', async () => {
        getUserActivityAPI.mockRejectedValueOnce(new Error('Mocked API Error'));
        render(<UserActivityPage />);
        expect(await screen.findByText('Mocked API Error')).toBeInTheDocument();
    });
});
