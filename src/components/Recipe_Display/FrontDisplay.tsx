import Image from "next/image"
import { Button } from '@headlessui/react'
import { HandThumbUpIcon } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolid, ArrowRightCircleIcon } from '@heroicons/react/24/solid'
import { call_api } from "../../utils/utils";
import { ExtendedRecipe } from '../../types';


interface FrontDisplayProps {
    recipe: ExtendedRecipe
    showRecipe: (recipe: ExtendedRecipe) => void
    updateRecipeList: (recipe: ExtendedRecipe) => void
}

const getThumbsup = ({ liked, owns }: { liked: boolean, owns: boolean }) => {
    if (owns) {
        return <HandThumbUpSolid className="block h-6 w-6 text-gray-500" />
    }
    if (liked) {
        return <HandThumbUpSolid className="block h-6 w-6 text-blue-500" />
    }
    return <HandThumbUpIcon className="block h-6 w-6 text-blue-500" />
}


function FrontDisplay({ recipe, showRecipe, updateRecipeList }: FrontDisplayProps) {

    const handleRecipeLike = async (recipeId: string) => {
        try {
            const result = await call_api({ address: '/api/like-recipe', method: 'put', payload: { recipeId } })
            updateRecipeList(result);
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="max-w-sm bg-gradient-to-r from-slate-200 to-stone-100 border border-gray-200 rounded-lg shadow-lg mt-4 mb-2 transform transition-transform hover:scale-105 hover:shadow-lg flex flex-col h-full">
            <div className="relative w-full h-64"> {/* Add a container for the image */}
                <Image
                    src={recipe.imgLink}
                    fill
                    alt={recipe.name}
                    style={{ objectFit: 'cover' }}
                    className="rounded-t-lg"
                    priority
                    sizes="auto"
                />
            </div>
            <div className="p-5 flex-grow">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 drop-shadow-lg">{recipe.name}</h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">{recipe.additionalInformation.nutritionalInformation}</p>
            </div>
            <div className="mx-auto flex">
                {
                    recipe.dietaryPreference.map((preference) => (
                        <span key={preference} className="chip bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded hover:scale-110">{preference}</span>
                    ))
                }
            </div>
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <Button
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={() => showRecipe(recipe)}
                    >
                        See Recipe
                        <ArrowRightCircleIcon className="block ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        className="py-1.5 px-3 hover:text-blue-600 hover:scale-105 hover:shadow text-center border border-gray-300 rounded-md border-gray-400 h-8 text-sm flex items-center gap-1 lg:gap-2"
                        onClick={() => handleRecipeLike(recipe._id)}
                        disabled={recipe.owns}
                        data-testid="like_button"
                    >
                        {getThumbsup(recipe)}
                        <span>{recipe.likedBy.length}</span>
                    </Button>
                </div>
            </div>
        </div>

    )
}

export default FrontDisplay


