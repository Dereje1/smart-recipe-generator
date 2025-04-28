import Image from 'next/image';
import UserLink from './UserLink';
import { formatDate } from '../utils/utils';
import { ExtendedRecipe } from '../types';

interface RecipeHeaderProps {
    recipeData: ExtendedRecipe;
}

const RecipeHeader = ({ recipeData }: RecipeHeaderProps) => (
    <>
        {/* Recipe Image using Next.js Image component */}
        <div className="relative w-full h-80">
            <Image
                src={recipeData.imgLink} // Image source from recipe data
                alt={recipeData.name} // Alt text for accessibility
                fill // Fill the parent container
                style={{ objectFit: 'cover' }} // Ensure the image covers the container without distortion
                className="transform hover:scale-105 transition-transform duration-300" // Add hover effect for scaling
                priority // Load the image with high priority
            />
        </div>
        <div className="pl-6 pt-6 pr-6">
            {/* Recipe Title */}
            <h2 className="text-2xl font-bold mb-2 mt-2">{recipeData.name}</h2> {/* Title with styling */}

            {/* Owner Information */}
            <div className="flex items-center mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                        src={recipeData.owner.image} // Owner's image source
                        alt={recipeData.owner.name} // Alt text for accessibility
                        fill // Fill the parent container
                        style={{ objectFit: 'cover' }} // Ensure the image covers the container
                        className="rounded-full" // Make the image circular
                    />
                </div>
                <div>
                    <span className="text-gray-700 text-lg">By <UserLink
                        userId={recipeData.owner._id}
                        name={recipeData.owner.name}
                    /></span>
                    <p className="text-sm text-gray-500">{formatDate(recipeData.createdAt)}</p>
                </div>
            </div>

            {/* Dietary Preferences */}
            <div className="mb-0">
                <h3 className="text-xl font-semibold mb-2">Dietary Preferences</h3> {/* Section title */}
                <div className="flex flex-wrap gap-2"> {/* Flex container with wrapping and gap */}
                    {recipeData.dietaryPreference.map((preference) => (
                        <span
                            key={preference} // Unique key for each preference
                            className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full" // Badge styling
                        >
                            {preference} {/* Display the dietary preference */}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </>
);

export default RecipeHeader;
