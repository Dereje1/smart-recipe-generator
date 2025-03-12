import { useEffect, useState } from 'react';

const generationMessages = [
    '🔪 Chopping up some fresh ingredients...',
    '🥘 Stirring the pot with expert precision...',
    '🍳 Heating the pan to the perfect temperature...',
    '🧂 Adding a pinch of magic (and salt)...',
    '🍅 Tossing in the tomatoes—watch out for splashes!',
    '🔥 Turning up the heat for that perfect sear...',
    '🧁 Sprinkling in some creativity and flavor...',
    '🍽️ Plating the dish like a Michelin-star chef...',
    '🥄 Taste-testing... hmm, needs just a little more zest!',
    '🧑‍🍳 Adjusting the seasoning like a pro...',
    '🥖 Tearing up some fresh bread for the side...',
    '🍋 Squeezing in a bit of citrus for balance...',
    '🍷 Deglazing the pan with a splash of wine...',
    '🌀 Blending flavors together into something amazing...',
    '💡 A spark of inspiration—trying a new twist on the recipe!',
    '🌿 Garnishing with a touch of fresh herbs...',
    '⏳ Giving it time to simmer and develop rich flavors...',
    '🎨 Perfecting the presentation—food is art, after all!',
    '📸 Snapping a pic before serving—this one’s a beauty!',
    '🥢 Arranging everything just right before the final reveal...',
];

const savingMessages = [
    '🖼️ Generating beautiful images for your recipe...', // OpenAI image generation
    '🚀 Fetching the perfect visuals from AI...', // OpenAI image retrieval
    '📤 Uploading your recipe images to the cloud...', // Uploading to S3
    '☁️ Storing images securely on our servers...', // Confirming image storage
    '📝 Preparing your recipe details...', // Recipe structuring before saving
    '💾 Saving your recipe to your personal cookbook...', // Database save
    '📑 Finalizing everything and making it just right...', // Final processing
];

const finalGenerationMessage = '🍳 Finalizing your recipe... hold tight, flavor takes time!';
const finalSavingMessage = '🔄 Putting it all together... fetching images, saving your recipe, and making sure everything is perfect!';

const Loading = ({
    isComplete = false,
    isProgressBar = false,
    loadingType = 'generation', // Default to recipe generation
}: {
    isComplete?: boolean;
    isProgressBar?: boolean;
    loadingType?: 'generation' | 'saving';
}) => {
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(
        loadingType === 'saving' ? savingMessages[0] : generationMessages[0]
    );

    useEffect(() => {
        if (!isProgressBar) return;

        if (isComplete) {
            setProgress(100);
            setCurrentMessage('✅ Your recipe is ready!');
            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    setCurrentMessage(loadingType === 'saving' ? finalSavingMessage : finalGenerationMessage);
                    return prev;
                }

                const newProgress = prev + Math.floor(Math.random() * 4) + 2;

                if (newProgress < 90) {
                    const messages = loadingType === 'saving' ? savingMessages : generationMessages;
                    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
                } else if (newProgress >= 90) {
                    setCurrentMessage(loadingType === 'saving' ? finalSavingMessage : finalGenerationMessage);
                }

                return Math.min(newProgress, 90);
            });
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [isComplete, isProgressBar, loadingType]);

    // 🚀 Responsive Progress Bar
    if (isProgressBar) {
        return (
            <div className="flex flex-col items-center justify-center mt-5 px-4 w-full">
                <div className="w-full max-w-lg sm:max-w-md bg-gray-300 rounded-full h-6 shadow-lg relative overflow-hidden">
                    <div
                        className="h-6 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-md animate-pulse"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{
                            width: `${progress}%`,
                            transition: 'width 0.5s ease-in-out',
                        }}
                    />
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-800 animate-pulse text-center px-2">
                    {currentMessage}
                </p>
                <p className="mt-1 text-sm text-gray-500">{progress}% completed</p>
            </div>
        );
    }

    // Default Spinner for Other Scenarios
    return (
        <div className="flex items-center justify-center mt-5">
            <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
                <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
            </div>
        </div>
    );
};

export default Loading;
