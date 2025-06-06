import { useRouter } from 'next/router';
import { useRecipeData } from '../components/Hooks/useRecipeData';
import RecipeHeader from '../components/RecipeHeader';
import ChatBox from '../components/ChatBox';
import Loading from '../components/Loading';
import ErrorPage from "./auth/error";

export default function ChatAssistantPage() {
    const router = useRouter();
    const { recipeId } = router.query as { recipeId?: string };
    const { recipeData, loading, error } = useRecipeData(recipeId);

    if (!recipeId) return <ErrorPage message="Missing recipe ID." />;
    if (loading) return <Loading />;
    if (error) return <ErrorPage message={error} />;
    if (!recipeData) return <ErrorPage message="No recipe data found." />;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <RecipeHeader recipeData={recipeData} />
                <div className="p-6">
                    <h3 className="mb-4">Ask the AI Assistant</h3>
                    <ChatBox recipeId={recipeId} />
                </div>
            </div>
        </div>
    );
}
