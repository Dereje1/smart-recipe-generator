
import { useSession } from 'next-auth/react';
import Image from 'next/image'
import { ExtendedRecipe } from '../../types';
import { Button } from '@headlessui/react';

interface ProfileInformationProps {
    recipes: ExtendedRecipe[]
    updateSelection: (s: string) => void
    selectedDisplay: string
}
function ProfileInformation({ recipes, updateSelection, selectedDisplay }: ProfileInformationProps) {
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
                        <Button
                            onClick={() => updateSelection('created')}
                            className={`bg-white rounded-md ${selectedDisplay === 'created' ? 'text-rose-700 font-bold' : 'text-black hover:text-blue-500 hover:underline'}`}
                        >
                            Recipes Created
                        </Button>
                    </div>
                    <div>
                        <div className="text-lg font-medium text-black">{votesReceived}</div>
                        <Button
                            onClick={() => updateSelection('votes received')}
                            className={`bg-white rounded-md ${selectedDisplay === 'votes received' ? 'text-rose-700 font-bold' : 'text-black hover:text-blue-500 hover:underline'}`}
                        >
                            Votes Received
                        </Button>
                    </div>
                    <div>
                        <div className="text-lg font-medium text-black">{favoriteRecipes.length}</div>
                        <Button
                            onClick={() => updateSelection('favorites')}
                            className={`bg-white rounded-md ${selectedDisplay === 'favorites' ? 'text-rose-700 font-bold' : 'text-black hover:text-blue-500 hover:underline'}`}
                        >
                            Favorites
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ProfileInformation;