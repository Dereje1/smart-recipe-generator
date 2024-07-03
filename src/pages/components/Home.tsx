import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import withAuth from './withAuth'
import FrontDisplay from './Recipe_Display/FrontDisplay'
import Dialog from '../components/Recipe_Display/Dialog'
import { ExtendedRecipe } from '../../types';


const initialDialogContents: ExtendedRecipe | null = null

function Home({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [openDialog, setOpenDialog] = useState(initialDialogContents);
    const handleShowRecipe = (recipe: ExtendedRecipe) => {
        setOpenDialog(recipe)
    }
    if(!recipes.length) return null;
    return (
        <>
            <div className="flex justify-center items-center min-h-screen p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recipes.map((recipe, idx) => (
                        <FrontDisplay key={recipe._id} recipe={recipe} showRecipe={handleShowRecipe} />
                    ))}
                </div>
            </div>

            <Dialog
                isOpen={Boolean(openDialog)}
                close={() => setOpenDialog(null)}
                recipe={openDialog}
            />
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