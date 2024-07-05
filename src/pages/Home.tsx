import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { Button, Input } from '@headlessui/react'
import withAuth from '../components/withAuth'
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import { getFilteredRecipes } from '../utils/utils';
import { ExtendedRecipe } from '../types';



function Home({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [recipesToView, setRecipesToView] = useState(recipes);
    const [searchVal, setSearchVal] = useState('')

    useEffect(() => {
        setRecipesToView(recipes)
    }, [recipes])

    useEffect(() => {
        if (!searchVal.trim()) {
            setRecipesToView(recipes)
        }
    }, [searchVal, recipes])

    const handleSearch = () => {
        const filteredRecipes = getFilteredRecipes(recipes, searchVal.trim().toLowerCase());
        setRecipesToView(filteredRecipes)
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
            <ViewRecipes recipes={recipesToView} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const session = await getSession(context);
        if (!session) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }
        const { data: recipes } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recipes`, {
            headers: {
                Cookie: context.req.headers.cookie || '',
            },
        });
        return {
            props: {
                recipes,
            },
        };
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
        return {
            props: {
                recipes: [],
            },
        };
    }
};

export default withAuth(Home);