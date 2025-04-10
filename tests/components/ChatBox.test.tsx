import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBox from '../../src/components/ChatBox';
import * as apiCalls from '../../src/utils/utils';

jest.mock('react-markdown', () => {
    const ReactMarkdownMock = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ReactMarkdownMock.displayName = 'ReactMarkdownMock';
    return ReactMarkdownMock;
});

jest.mock('../../src/utils/utils', () => ({
    ...jest.requireActual('../../src/utils/utils'),
    call_api: jest.fn(),
}));

describe('ChatBox Component', () => {
    const recipeId = 'test-recipe-id';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the input and send button', () => {
        render(<ChatBox recipeId={recipeId} />);
        expect(screen.getByPlaceholderText('Ask a question about this recipe...')).toBeInTheDocument();
        expect(screen.getByText('Send')).toBeInTheDocument();
    });

    it('should send a user message and receive assistant reply', async () => {
        (apiCalls.call_api as jest.Mock).mockImplementationOnce(() =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ reply: 'This is a reply.' });
                }, 100); // delay long enough for "typing..." to render
            })
        );

        render(<ChatBox recipeId={recipeId} />);

        const input = screen.getByPlaceholderText('Ask a question about this recipe...');
        const sendBtn = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'What can I substitute for garlic?' } });
        fireEvent.click(sendBtn);

        expect(await screen.findByText('What can I substitute for garlic?')).toBeInTheDocument();
        expect(await screen.findByText('Assistant is typing...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('This is a reply.')).toBeInTheDocument();
        });
    });

    it('should show fallback error message if API call fails', async () => {
        (apiCalls.call_api as jest.Mock).mockRejectedValueOnce(new Error('API failure'));

        render(<ChatBox recipeId={recipeId} />);

        const input = screen.getByPlaceholderText('Ask a question about this recipe...');
        fireEvent.change(input, { target: { value: 'Trigger error' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
        });
    });

    it('should disable send button when input is empty or loading', () => {
        render(<ChatBox recipeId={recipeId} />);

        const sendBtn = screen.getByText('Send');
        expect(sendBtn).toBeDisabled(); // initially empty input

        const input = screen.getByPlaceholderText('Ask a question about this recipe...');
        fireEvent.change(input, { target: { value: 'Hi' } });
        expect(sendBtn).not.toBeDisabled();
    });
});
