import { useEffect, useState, useRef, useCallback } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/SearchBar';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import FloatingActionButtons from '../components/FloatingActionButtons';
import Loading from '../components/Loading';
import PopularTags from '../components/PopularTags';
import { updateRecipeList, call_api } from '../utils/utils';
import { ExtendedRecipe } from '../types';

type LatestRecipes = {
    recipes: ExtendedRecipe[];
    updateIndex: string | null;
};

interface Tag {
    _id: string;
    count: number;
}

const Home = () => {
    const [latestRecipes, setLatestRecipes] = useState<LatestRecipes>({ recipes: [], updateIndex: null });
    const [searchVal, setSearchVal] = useState('');
    const [searchView, setSearchView] = useState<ExtendedRecipe[]>([]);
    const [sortOption, setSortOption] = useState<'recent' | 'popular'>('popular');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [popularTags, setPopularTags] = useState<Tag[]>([]);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (loading || page > totalPages) return;
            setLoading(true);
            try {
                const { recipes, totalPages: newTotalPages, popularTags: newPopularTags } = await call_api({
                    address: `/api/get-recipes?page=${page}&limit=12&sortOption=${sortOption}`,
                    method: 'get',
                });
                setLatestRecipes((prev) => ({
                    recipes: [...prev.recipes, ...recipes],
                    updateIndex: null
                }));
                setSearchView((prevSearchView) => prevSearchView.length ? prevSearchView : latestRecipes.recipes);
                setTotalPages(newTotalPages);
                setPopularTags(newPopularTags)
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
            setSearchView(latestRecipes.recipes); // Directly set recipes without sorting
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
            if (entries[0]?.isIntersecting && page < totalPages && !searchVal.trim()) {
                setPage((prevPage) => prevPage + 1);
            }
        }, { threshold: 0.5 });

        observerRef.current.observe(lastRecipeElement);

        return () => observerRef.current?.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchView]); // Runs when new recipes load


    const handleRecipeListUpdate = (recipe: ExtendedRecipe | null, deleteId?: string) => {
        setLatestRecipes({
            recipes: updateRecipeList(latestRecipes.recipes, recipe, deleteId),
            updateIndex: recipe?._id || null
        });
        setSearchView((prevSearchView) => prevSearchView.length ?
            updateRecipeList(prevSearchView, recipe, deleteId) :
            latestRecipes.recipes
        );
    };

    const handleSearch = useCallback(() => {
        if (!searchVal.trim()) return;

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setSearchView([]);
            setLoading(true);
            const filteredRecipes = await call_api({
                address: `/api/search-recipes?query=${encodeURIComponent(searchVal.trim())}`,
            });
            setLoading(false);
            setSearchView(filteredRecipes);
        }, 500); // Adjust debounce delay (500ms)
    }, [searchVal]);

    const sortRecipes = (option: 'recent' | 'popular') => {
        if (sortOption === option) return;
        setLatestRecipes({ recipes: [], updateIndex: null })
        setSortOption(option);
        setPage(1)
    };

    const handleTagSearch = async (tag: string) => {
        if (searchVal === tag) {
            // If the same tag is clicked again, reset to all recipes
            setSearchVal("");
            setSearchView(latestRecipes.recipes);
            return;
        }

        // Set searchVal to the selected tag for UI purposes
        setSearchVal(tag);
        setSearchView([]); // Clear previous results
        setLoading(true);

        try {
            const filteredRecipes = await call_api({
                address: `/api/search-recipes?query=${encodeURIComponent(tag)}`,
            });
            setSearchView(filteredRecipes);
        } catch (error) {
            console.error("Error fetching recipes by tag:", error);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen items-center px-4">
            <SearchBar searchVal={searchVal} setSearchVal={setSearchVal} handleSearch={handleSearch} />
            <PopularTags tags={popularTags} onTagToggle={handleTagSearch} searchVal={searchVal} />
            {/* Sorting Buttons */}
            <div className="flex space-x-4 mt-4 mb-4">
                <button
                    onClick={() => sortRecipes('recent')}
                    className={`disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-white flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'recent' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg'
                        }`}
                    disabled={Boolean(searchVal.trim())}
                >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Most Recent
                </button>
                <button
                    onClick={() => sortRecipes('popular')}
                    className={`disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-white flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'popular' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg"'
                        }`}
                    disabled={Boolean(searchVal.trim())}
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