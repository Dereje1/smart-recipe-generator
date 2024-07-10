
import { useSession } from 'next-auth/react';
import Image from 'next/image'
import { ExtendedRecipe } from '../../types';

function ProfileInformation({ recipes }: { recipes: ExtendedRecipe[] }) {
    const { data: session } = useSession();

    if (!session || !session.user) return null;

    const { user } = session;

    const ownedRecipes = recipes.filter(r => r.owns)
    const favoriteRecipes = recipes.filter(r => r.liked)
    const votesReceived = ownedRecipes.reduce((total, recipe) => (total + recipe.likedBy.length), 0)

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-5">
            <div className="flex justify-end ">
            </div>
            <div className="flex flex-col items-center pb-10 px-4 pt-4">
                <Image
                    src={user?.image || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                    width={75}
                    height={75}
                    className="w-24 h-24 mb-3 rounded-full shadow-lg"
                    alt={`profile-${user.name}`}
                />
                <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{user.name}</h5>
                <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
                <div className="grid grid-cols-3 gap-4 text-center mt-2">
                    <div>
                        <div className="text-lg font-medium text-black">{ownedRecipes.length}</div>
                        <p className="text-gray-500">Recipes Created</p>
                    </div>
                    <div>
                        <div className="text-lg font-medium text-black">{ votesReceived }</div>
                        <p className="text-gray-500">Votes Received</p>
                    </div>
                    <div>
                        <div className="text-lg font-medium text-black">{favoriteRecipes.length}</div>
                        <p className="text-gray-500">Favorites</p>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ProfileInformation;