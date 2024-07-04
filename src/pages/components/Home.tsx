import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import withAuth from './withAuth'
import ViewRecipes from './Recipe_Display/ViewRecipes';
import { ExtendedRecipe } from '../../types';


function Home({ recipes }: { recipes: ExtendedRecipe[] }) {

    return (
        <ViewRecipes recipes={recipes} />
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
        const connection = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api/recipes' : ''
        const { data: recipes } = await axios.get(connection, {
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