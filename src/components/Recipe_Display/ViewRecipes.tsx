
import { useState } from 'react';
import FrontDisplay from './FrontDisplay'
import Dialog from './Dialog'
import { ExtendedRecipe } from '../../types';

interface ViewRecipesProps {
    recipes: ExtendedRecipe[],
    handleRecipeListUpdate: (r: ExtendedRecipe) => void
}
const initialDialogContents: ExtendedRecipe | null = null

function ViewRecipes({ recipes, handleRecipeListUpdate }: ViewRecipesProps) {
    const [openDialog, setOpenDialog] = useState(initialDialogContents);

    const handleShowRecipe = (recipe: ExtendedRecipe) => {
        setOpenDialog(recipe)
    }
    if (!recipes.length) return null;
    return (
        <>
            <div className="flex justify-center items-center min-h-screen p-5 mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recipes.map((recipe) => (
                        <FrontDisplay key={recipe._id} recipe={recipe} showRecipe={handleShowRecipe} updateRecipeList={handleRecipeListUpdate} />
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

export default ViewRecipes;