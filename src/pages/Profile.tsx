import { GetServerSideProps } from 'next';
import { useState } from 'react';
import ProfileInformation from '../components/Profile_Information/ProfileInformation';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import { getServerSidePropsUtility, updateRecipeList } from '../utils/utils';
import { ExtendedRecipe } from '../types';

function Profile({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [latestRecipes, setLatestRecipes] = useState(recipes);
    const [displaySetting, setDisplaySetting] = useState('created')

    const handleRecipeListUpdate = (recipe: ExtendedRecipe | null, deleteId?: string) => {
        setLatestRecipes(updateRecipeList(latestRecipes, recipe, deleteId));
    }

    const handleDisplaySetting = () => {
        let view: ExtendedRecipe[] = []
        if (displaySetting === 'created') {
            view = latestRecipes.filter(r => r.owns);
        } else if (displaySetting === 'favorites') {
            view = latestRecipes.filter(r => r.liked);
        } else {
            view = latestRecipes.filter(r => r.owns && r.likedBy.length > 0);
        }
        return view;
    }
    return (
        <div className="flex flex-col min-h-screen items-center">
            <ProfileInformation recipes={latestRecipes} updateSelection={(val) => setDisplaySetting(val)} selectedDisplay={displaySetting} />
            <ViewRecipes recipes={handleDisplaySetting()} handleRecipeListUpdate={handleRecipeListUpdate} />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/profile')
};

export default Profile;