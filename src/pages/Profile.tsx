import { GetServerSideProps } from 'next';
import { useState } from 'react';
import ProfileInformation from '../components/Profile_Information/ProfileInformation';
import ProfileStickyBanner from '../components/Profile_Information/ProfileStickyBanner';
import ViewRecipes from '../components/Recipe_Display/ViewRecipes';
import { getServerSidePropsUtility, updateRecipeList } from '../utils/utils';
import { ExtendedRecipe } from '../types';

interface ProfileProps {
    profileData: {
        recipes: ExtendedRecipe[];
        AIusage: number
    }
}

function Profile({ profileData }: ProfileProps) {
    const [latestRecipes, setLatestRecipes] = useState(profileData.recipes);
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
            {/* Show banner only if user has no recipes */}
            <ProfileStickyBanner userHasRecipes={latestRecipes.filter(r => r.owns).length !== 0} />
            <ProfileInformation
                recipes={latestRecipes}
                updateSelection={(val) => setDisplaySetting(val)}
                selectedDisplay={displaySetting}
                AIusage={profileData.AIusage}
            />
            <ViewRecipes recipes={handleDisplaySetting()} handleRecipeListUpdate={handleRecipeListUpdate} />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return await getServerSidePropsUtility(context, 'api/profile', 'profileData')
};

export default Profile;