import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Button, Input } from '@headlessui/react'
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import ScrollToTopButton from '../components/ScrollToTopButton';
import { getFilteredRecipes, getServerSidePropsUtility, updateRecipeList } from '../utils/utils';
import { ExtendedRecipe } from '../types';


const initialSearchView: ExtendedRecipe[] = []

function Home({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [latestRecipes, setLatestRecipes] = useState(recipes);
    const [searchVal, setSearchVal] = useState('')
    const [searchView, setSearchView] = useState(initialSearchView)

    useEffect(() => {
        if (!searchVal.trim()) {
            setSearchView(latestRecipes)
        }
    }, [searchVal, latestRecipes])

    const handleRecipeListUpdate = (recipe: ExtendedRecipe | null, deleteId?: string) => {
        setLatestRecipes(updateRecipeList(latestRecipes, recipe, deleteId));
    }

    const handleSearch = () => {
        const filteredRecipes = getFilteredRecipes(latestRecipes, searchVal.trim().toLowerCase());
        setSearchView(filteredRecipes)
    }

    return (

        <div className="flex flex-col min-h-screen items-center">
            <div className="w-full flex items-center justify-between p-4 rounded-lg shadow-md">
                <Input
                    className="w-full px-4 py-2 text-sm text-gray-700 placeholder-gray-500 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent"
                    placeholder="Search recipes by name, ingredient, or type..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                />
                <Button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 hover:shadow"
                    onClick={handleSearch}
                >
                    Search
                </Button>
                <Button
                    className="px-1 py-1 text-black font-bold bg-blue-300 rounded-r-lg hover:enabled:bg-blue-100 focus:enabled:outline-none hover:enabled:shadow data-[disabled]:bg-gray-200 data-[disabled]:text-black/10"
                    onClick={() => setSearchVal('')}
                    disabled={!searchVal.trim()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-7">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>
            <ViewRecipes recipes={searchView} handleRecipeListUpdate={handleRecipeListUpdate} />
            <ScrollToTopButton />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/get-recipes')
};

export default Home;