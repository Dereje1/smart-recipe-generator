import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import withAuth from './withAuth'
import ProfileInformation from './Profile_Information/ProfileInformation';
import ViewRecipes from './Recipe_Display/ViewRecipes';
import UserRecipeSelector from './Profile_Information/UserRecipeSelector';
import { ExtendedRecipe } from '../../types';
import { useEffect, useState } from 'react';

function Profile({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [recipesToView, setRecipesToView] = useState(recipes);
    const [displaySetting, setDisplaySetting] = useState('created')

    useEffect(() => {
        setRecipesToView(recipes.filter(r => r.owns))
    }, [recipes])

    const handleDisplaySetting = (val: string) => {
        let view = []
        if (val === 'created') {
            view = recipes.filter(r => r.owns);
        } else {
            view = recipes.filter(r => r.liked);
        }
        setRecipesToView(view)
        setDisplaySetting(val)
    }
    return (
        <div className="flex flex-col items-center">
            <ProfileInformation recipes={recipes} />
            <UserRecipeSelector displaySetting={displaySetting} setDisplaySetting={handleDisplaySetting} />
            <ViewRecipes recipes={recipesToView} />
        </div>
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

        const { data: recipes } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile`, {
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

export default withAuth(Profile);