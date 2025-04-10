import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { call_api } from '../utils/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type Props = {
    recipeId: string;
};

export default function ChatBox({ recipeId }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tokenTotal, setTokenTotal] = useState(0);

    const MAX_TOKENS = 3000;

    const handleSend = async () => {
        if (!input.trim() || tokenTotal >= MAX_TOKENS) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const { reply, totalTokens } = await call_api({
                address: '/api/chat-assistant',
                method: 'post',
                payload: {
                    message: input,
                    recipeId,
                    history: newMessages,
                },
            });

            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
            setTokenTotal((prev) => prev + (totalTokens || 0));
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Something went wrong. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 flex flex-col gap-4">
            {messages.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50 max-h-[400px] overflow-y-auto space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg text-sm max-w-[75%] ${
                                    msg.role === 'user'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="text-sm text-gray-500 italic">Assistant is typing...</div>
                    )}
                    {tokenTotal >= MAX_TOKENS && (
                        <div className="text-sm text-red-500 italic">
                            {`You've reached the token limit for this chat session.`}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    className="flex-grow border rounded-lg px-4 py-2 text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about this recipe..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                    disabled={tokenTotal >= MAX_TOKENS}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim() || tokenTotal >= MAX_TOKENS}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
