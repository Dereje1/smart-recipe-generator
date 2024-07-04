
import { useEffect, useState } from 'react';
import FrontDisplay from './FrontDisplay'
import Dialog from './Dialog'
import { updateRecipeList } from '../../../utils/utils';
import { ExtendedRecipe } from '../../../types';

const initialDialogContents: ExtendedRecipe | null = null
function ViewRecipes({ recipes }: { recipes: ExtendedRecipe[] }) {
    const [updatedRecipes, setUpdatedRecipes] = useState(recipes);
    const [openDialog, setOpenDialog] = useState(initialDialogContents);

    useEffect(() => {
        setUpdatedRecipes(recipes)
    }, [recipes])

    const handleShowRecipe = (recipe: ExtendedRecipe) => {
        setOpenDialog(recipe)
    }
    const handleRecipeListUpdate = (recipe: ExtendedRecipe) => {
        setUpdatedRecipes(updateRecipeList(updatedRecipes, recipe));
    }
    
    if (!recipes.length) return null;
    return (
        <>
            <div className="flex justify-center items-center min-h-screen p-5 mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {updatedRecipes.map((recipe) => (
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