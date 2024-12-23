import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { ClockIcon, FireIcon } from '@heroicons/react/24/solid';
import SearchBar from '../components/SearchBar';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { getFilteredRecipes, getServerSidePropsUtility, updateRecipeList, sortRecipesHelper } from '../utils/utils';
import { ExtendedRecipe } from '../types';

const initialSearchView: ExtendedRecipe[] = []

function Home({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [latestRecipes, setLatestRecipes] = useState(recipes);
    const [searchVal, setSearchVal] = useState('');
    const [searchView, setSearchView] = useState(initialSearchView);
    const [sortOption, setSortOption] = useState<'recent' | 'popular'>('popular'); // New state


    useEffect(() => {
        if (!searchVal.trim()) {
            const resetView = sortRecipesHelper(latestRecipes, sortOption);
            setSearchView(resetView);
        }
    }, [searchVal, latestRecipes, sortOption]);

    const handleRecipeListUpdate = (recipe: ExtendedRecipe | null, deleteId?: string) => {
        setLatestRecipes(updateRecipeList(latestRecipes, recipe, deleteId));
    };

    const handleSearch = () => {
        const filteredRecipes = getFilteredRecipes(latestRecipes, searchVal.trim().toLowerCase());
        setSearchView(filteredRecipes);
    };

    const sortRecipes = (option: 'recent' | 'popular') => {
        if (sortOption === option) return; // Skip if already sorted
        const sortedRecipes = sortRecipesHelper(searchView, option);
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

            <ViewRecipes recipes={searchView} handleRecipeListUpdate={handleRecipeListUpdate} />
            <ScrollToTopButton />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/get-recipes');
};

export default Home;
