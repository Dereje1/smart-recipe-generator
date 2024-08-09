
import { useState } from 'react';
import FrontDisplay from './FrontDisplay'
import Dialog from './Dialog'
import { call_api } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

interface ViewRecipesProps {
    recipes: ExtendedRecipe[],
    handleRecipeListUpdate: (r: ExtendedRecipe | null, deleteId?: string) => void
}
const initialDialogContents: ExtendedRecipe | null = null

function ViewRecipes({ recipes, handleRecipeListUpdate }: ViewRecipesProps) {
    const [openDialog, setOpenDialog] = useState(initialDialogContents);
    const [deleteId, setDeleteId] = useState('')

    const handleShowRecipe = (recipe: ExtendedRecipe) => {
        setOpenDialog(recipe)
    }
    const handleDeleteRecipe = async () => {
        if (!openDialog) return;
        try {
            setOpenDialog(null)
            setDeleteId(openDialog._id)
            const response = await call_api({
                address: '/api/delete-recipe',
                method: 'delete',
                payload: { data: { recipeId: openDialog._id } }
            })
            const { message, error } = response;
            if (error) {
                throw new Error(error)
            }
            if (message) {
                handleRecipeListUpdate(null, openDialog._id)
            }
        } catch (error) {
            console.error(error)
            setDeleteId('')
        }
    }

    if (!recipes.length) return null;
    return (
        <>
            <div className="flex justify-center items-center min-h-screen p-5 mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recipes.map((recipe) => (
                        <FrontDisplay
                            key={recipe._id}
                            recipe={recipe}
                            showRecipe={handleShowRecipe}
                            updateRecipeList={handleRecipeListUpdate}
                            isLoading={deleteId === recipe._id} />
                    ))}
                </div>
            </div>
            <Dialog
                isOpen={Boolean(openDialog)}
                close={() => setOpenDialog(null)}
                recipe={openDialog}
                deleteRecipe={handleDeleteRecipe}
            />
        </>
    )
}

export default ViewRecipes;