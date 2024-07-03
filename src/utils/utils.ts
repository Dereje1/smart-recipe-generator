import { ExtendedRecipe } from "../types"

export const filterResults = (recipes: ExtendedRecipe[]) => {
    return recipes.map((recipe)=> (
      {
        ...recipe,
        owner:{
          _id: recipe.owner._id,
          name: recipe.owner.name,
          image: recipe.owner.image
        }
      }
    ))
  }