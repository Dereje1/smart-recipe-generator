import { useEffect, useState, useRef } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/SearchBar';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import FloatingActionButtons from '../components/FloatingActionButtons';
import Loading from '../components/Loading';
import { getFilteredRecipes, updateRecipeList, call_api } from '../utils/utils';
import { ExtendedRecipe } from '../types';

type LatestRecipes = {
    recipes: ExtendedRecipe[];
    updateIndex: string | null;
};

const Home = () => {
    const [latestRecipes, setLatestRecipes] = useState<LatestRecipes>({ recipes: [], updateIndex: null });
    const [searchVal, setSearchVal] = useState('');
    const [searchView, setSearchView] = useState<ExtendedRecipe[]>([]);
    const [sortOption, setSortOption] = useState<'recent' | 'popular'>('popular');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (loading || page > totalPages) return;
            setLoading(true);
            try {
                if (page === 1) {
                    setLatestRecipes({ recipes: [], updateIndex: null })
                }
                const { recipes, totalPages: newTotalPages } = await call_api({
                    address: `/api/get-recipes?page=${page}&limit=12&sortOption=${sortOption}`,
                    method: 'get',
                });
                setLatestRecipes((prev) => ({
                    recipes: [...prev.recipes, ...recipes],
                    updateIndex: null
                }));
                setSearchView((prevSearchView) => prevSearchView.length ? prevSearchView : latestRecipes.recipes);
                setTotalPages(newTotalPages);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
            setLoading(false);
        };

        fetchRecipes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortOption, page]);

    useEffect(() => {
        if (!searchVal.trim()) {
            setSearchView(latestRecipes.recipes); // ✅ Directly set recipes without sorting
        }
    }, [searchVal, latestRecipes, sortOption]);

    useEffect(() => {
        if (!searchView.length) return;

        // 🔹 TEMPORARY WORKAROUND:
        // Instead of using a React ref, we are directly querying the DOM to attach the observer.
        // This is because React's ref assignment is currently not triggering as expected.
        // Once the root cause is identified, we should refactor this back to the correct React ref approach.

        const lastRecipeElement = document.querySelector(".recipe-card:last-child");
        if (!lastRecipeElement) {
            console.log("No last recipe found!");
            return;
        }

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && page < totalPages) {
                setPage((prevPage) => prevPage + 1);
            }
        }, { threshold: 0.5 });

        observerRef.current.observe(lastRecipeElement);

        return () => observerRef.current?.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchView]); // ✅ Runs when new recipes load


    const handleRecipeListUpdate = (recipe: ExtendedRecipe | null, deleteId?: string) => {
        setLatestRecipes({
            recipes: updateRecipeList(latestRecipes.recipes, recipe, deleteId),
            updateIndex: recipe?._id || null
        });
    };

    const handleSearch = () => {
        const filteredRecipes = getFilteredRecipes(latestRecipes.recipes, searchVal.trim().toLowerCase());
        setSearchView(filteredRecipes);
    };

    const sortRecipes = (option: 'recent' | 'popular') => {
        if (sortOption === option) return;
        setSortOption(option);
        setPage(1)
    };

    return (
        <div className="flex flex-col min-h-screen items-center px-4">
            <SearchBar searchVal={searchVal} setSearchVal={setSearchVal} handleSearch={handleSearch} />

            {/* Sorting Buttons */}
            <div className="flex space-x-4 mt-4 mb-4">
                <button
                    onClick={() => sortRecipes('recent')}
                    className={`flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'recent' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg'
                        }`}
                >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Most Recent
                </button>
                <button
                    onClick={() => sortRecipes('popular')}
                    className={`flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'popular' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg'
                        }`}
                >
                    <FireIcon className="h-5 w-5 mr-2" />
                    Most Popular
                </button>
            </div>

            <ViewRecipes recipes={searchView} handleRecipeListUpdate={handleRecipeListUpdate} />
            <FloatingActionButtons />

            {/* Show loading indicator when fetching */}
            {loading && <Loading />}
        </div>
    );
};

export default Home;