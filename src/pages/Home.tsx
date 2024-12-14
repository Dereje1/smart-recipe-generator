import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Button, Input } from '@headlessui/react'
import SearchBar from '../components/SearchBar';
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

        <div className="flex flex-col min-h-screen items-center px-4">
            <SearchBar
                searchVal={searchVal}
                setSearchVal={setSearchVal}
                handleSearch={handleSearch}
            />
            <ViewRecipes recipes={searchView} handleRecipeListUpdate={handleRecipeListUpdate} />
            <ScrollToTopButton />
        </div>


    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/get-recipes')
};

export default Home;