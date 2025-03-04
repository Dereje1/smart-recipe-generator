import { useEffect, useState, useRef } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/SearchBar';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import FloatingActionButtons from '../components/FloatingActionButtons';
import { getFilteredRecipes, updateRecipeList, sortRecipesHelper, call_api } from '../utils/utils';
import { ExtendedRecipe } from '../types';

const initialSearchView: ExtendedRecipe[] = []
type latestRecipes = {
    recipes: ExtendedRecipe[],
    updateIndex: string | null
}

function Home() {
    const [latestRecipes, setLatestRecipes] = useState<latestRecipes>({
        recipes:[],
        updateIndex: null
    });
    const [searchVal, setSearchVal] = useState('');
    const [searchView, setSearchView] = useState(initialSearchView);
    const [sortOption, setSortOption] = useState<'recent' | 'popular'>('popular'); // New state
    const [loading, setLoading] = useState(false);

    // Create refs to store the *previous* values
    const prevLatestRecipes = useRef(latestRecipes);

     // ✅ Step #1: Fetch Recipes on Component Mount (Replacing getServerSideProps)
     useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const {recipes} = await call_api({
                    address: `/api/get-recipes`,
                    method: 'get',
                });
                setLatestRecipes({
                    recipes,
                    updateIndex: null
                });
                setSearchView(sortRecipesHelper(recipes, sortOption)); // Default sorting
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
            setLoading(false);
        };

        fetchRecipes();
    }, [sortOption]);

    useEffect(() => {
        if (prevLatestRecipes.current !== latestRecipes) {
            const newRecipe = latestRecipes.recipes.filter(r => r._id === latestRecipes.updateIndex)[0]
            setSearchView(prevSearchView => updateRecipeList(prevSearchView, newRecipe));
            prevLatestRecipes.current = latestRecipes;  // Updating after checking
        }

        if (!searchVal.trim()) {
            setSearchView(prevSearchView => 
                prevSearchView.length !== latestRecipes.recipes.length
                    ? sortRecipesHelper(latestRecipes.recipes, sortOption)
                    : prevSearchView
            );
        }
    }, [searchVal, latestRecipes, sortOption]);

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
        if (sortOption === option) return; // Skip if already sorted
        const sortedRecipes = sortRecipesHelper(latestRecipes.recipes, option);
        setSortOption(option);
        setSearchView(sortedRecipes); // Update the displayed recipes
    };

    return (
        <div className="flex flex-col min-h-screen items-center px-4">
            <SearchBar
                searchVal={searchVal}
                setSearchVal={setSearchVal}
                handleSearch={handleSearch}
            />

            {/* Sorting Buttons */}
            <div className="flex space-x-4 mt-4 mb-4">
                <button
                    onClick={() => sortRecipes('recent')}
                    className={`flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'recent'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg'
                        }`}
                >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Most Recent
                </button>
                <button
                    onClick={() => sortRecipes('popular')}
                    className={`flex items-center px-4 py-2 rounded shadow-md transition duration-300 ${sortOption === 'popular'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 hover:shadow-lg'
                        }`}
                >
                    <FireIcon className="h-5 w-5 mr-2" />
                    Most Popular
                </button>
            </div>
            {/* Show loading indicator when fetching */}
            {loading ? <p className="text-gray-500">Loading recipes...</p> : null}

            <ViewRecipes recipes={searchView} handleRecipeListUpdate={handleRecipeListUpdate} />
            <FloatingActionButtons />
        </div>
    );
}

export default Home;
