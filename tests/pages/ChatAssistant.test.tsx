import ChatAssistantPage from "../../src/pages/ChatAssistant";
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import * as apiCalls from "../../src/utils/utils";
import { stub_recipe_1 } from '../stub';

const routePushMock = jest.fn();

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathName: 'mocked Path',
        push: routePushMock,
        query: {
            recipeId: 'stub_recipeid'
        },
        events: {
            on: jest.fn(),
            off: jest.fn()
        }
    })),
}));

jest.mock("next/image");

jest.mock("../../src/utils/utils", () => ({
    ...jest.requireActual("../../src/utils/utils"),
    call_api: jest.fn()
}));

jest.mock('react-markdown', () => {
    const ReactMarkdownMock = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ReactMarkdownMock.displayName = 'ReactMarkdownMock';
    return ReactMarkdownMock;
});

describe('The ChatAssistant Page', () => {
    it('shall successfully render a recipe', async () => {
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.resolve(stub_recipe_1));

        const { container } = render(<ChatAssistantPage />);

        expect(await screen.findByText('Recipe_1_name')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it('shall render the error page if no recipe id is provided', async () => {
        (useRouter as jest.Mock).mockImplementationOnce(() => ({
            query: {},
        }));

        render(<ChatAssistantPage />);

        expect(await screen.findByText('Missing recipe ID.')).toBeInTheDocument();
    });

    it('shall render the error page if there is an API fetch error', async () => {
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.reject({ message: 'Fetch error message' }));

        render(<ChatAssistantPage />);

        expect(await screen.findByText('Fetch error message')).toBeInTheDocument();
    });

    it('shall render the error page if no data is returned from API', async () => {
        const getRecipeFromAPI = jest.spyOn(apiCalls, 'call_api');
        getRecipeFromAPI.mockImplementationOnce(() => Promise.resolve(undefined));

        render(<ChatAssistantPage />);

        expect(await screen.findByText('No recipe data found.')).toBeInTheDocument();
    });
});
