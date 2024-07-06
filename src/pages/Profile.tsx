import { GetServerSideProps } from 'next';
import { useState } from 'react';
import withAuth from '../components/withAuth'
import ProfileInformation from '../components/Profile_Information/ProfileInformation';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import UserRecipeSelector from '../components/Profile_Information/UserRecipeSelector';
import { getServerSidePropsUtility, updateRecipeList } from '../utils/utils';
import { ExtendedRecipe } from '../types';

function Profile({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [latestRecipes, setLatestRecipes] = useState(recipes);
    const [displaySetting, setDisplaySetting] = useState('created')

    const handleRecipeListUpdate = (recipe: ExtendedRecipe) => {
        setLatestRecipes(updateRecipeList(latestRecipes, recipe));
    }

    const handleDisplaySetting = () => {
        let view = []
        if (displaySetting === 'created') {
            view = latestRecipes.filter(r => r.owns);
        } else {
            view = latestRecipes.filter(r => r.liked);
        }
        return view;
    }
    return (
        <div className="flex flex-col items-center">
            <ProfileInformation recipes={latestRecipes} />
            <UserRecipeSelector displaySetting={displaySetting} setDisplaySetting={(val) => setDisplaySetting(val)} />
            <ViewRecipes recipes={handleDisplaySetting()} handleRecipeListUpdate={handleRecipeListUpdate} />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/profile')
};

export default withAuth(Profile);