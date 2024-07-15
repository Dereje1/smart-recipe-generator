import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Button, Input } from '@headlessui/react'
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import { getFilteredRecipes, getServerSidePropsUtility, updateRecipeList } from '../utils/utils';
import { ExtendedRecipe } from '../types';


const initialSearchView: ExtendedRecipe[] = []

function Home({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [latestRecipes, setLatestRecipes] = useState(recipes);
    const [searchVal, setSearchVal] = useState('')
    const [searchView, setSearchView] = useState(initialSearchView)

    useEffect(() => {
        if (!searchVal.trim()) {
            setSearchView([])
        }
    }, [searchVal, latestRecipes])

    const handleRecipeListUpdate = (recipe: ExtendedRecipe) => {
        setLatestRecipes(updateRecipeList(latestRecipes, recipe));
    }

    const handleSearch = () => {
        const filteredRecipes = getFilteredRecipes(latestRecipes, searchVal.trim().toLowerCase());
        setSearchView(filteredRecipes)
    }

    return (
        <>
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md">
                <Input
                    className="w-full px-4 py-2 text-sm text-gray-700 placeholder-gray-500 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent"
                    placeholder="Search..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                />
                <Button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-r-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 hover:shadow"
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </div>
            <ViewRecipes recipes={searchView.length ? searchView : latestRecipes} handleRecipeListUpdate={handleRecipeListUpdate}/>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/recipes')
};

export default Home;