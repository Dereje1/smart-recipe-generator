import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import RecipeHeader from '../components/RecipeHeader';
import Loading from '../components/Loading';
import ErrorPage from "./auth/error";
import { call_api } from "../utils/utils";
import { ExtendedRecipe } from '../types';

export default function ChatAssistantPage() {
    const router = useRouter();
    const { recipeId } = router.query as { recipeId?: string };

    const [recipeData, setRecipeData] = useState<ExtendedRecipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await call_api({
                    address: `/api/get-single-recipe?recipeId=${recipeId}`,
                });
                setRecipeData(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        if (recipeId) {
            fetchRecipe();
        }
    }, [recipeId]);

    if (!recipeId) return <ErrorPage message="Missing recipe ID." />;
    if (loading) return <Loading />;
    if (error) return <ErrorPage message={error} />;
    if (!recipeData) return <ErrorPage message="No recipe data found." />;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <RecipeHeader recipeData={recipeData} />

                {/* Chat UI placeholder */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Ask the AI Assistant</h3>
                    <div className="border rounded-lg p-4 bg-gray-50 text-gray-600 italic">
                        ChatBox coming soon...
                    </div>
                </div>
            </div>
        </div>
    );
}
