import { ExtendedRecipe } from "../types"

export const filterResults = (recipes: ExtendedRecipe[], userId: string) => {
  return recipes.map((recipe) => (
    {
      ...recipe,
      owner: {
        _id: recipe.owner._id,
        name: recipe.owner.name,
        image: recipe.owner.image
      },
      owns: recipe.owner._id.toString() === userId,
      liked: recipe.likedBy.some(l => l._id.toString() === userId)
    }
  ))
}

export const updateRecipeList = (oldList: ExtendedRecipe[], newRecipe: ExtendedRecipe) => {
  const indexOfUpdate = oldList.findIndex((p) => p._id === newRecipe._id);
  return [
    ...oldList.slice(0, indexOfUpdate),
    newRecipe,
    ...oldList.slice(indexOfUpdate + 1),
  ];
};

export const getFilteredRecipes = (recipes: ExtendedRecipe[], search: string | null) => {
  if (!search) return recipes;
  const filteredRecipes = recipes.filter(({ name, ingredients, dietaryPreference }) => {
      const isFoundInName = name.toLowerCase().includes(search);
      const isFoundInIngredients = ingredients.filter(ingredient => ingredient.name.toLowerCase().includes(search))
      const isFoundInDiets = dietaryPreference.filter(diet => diet.toLowerCase().includes(search))
      return isFoundInName || Boolean(isFoundInIngredients.length) || Boolean(isFoundInDiets.length);
  });
  return filteredRecipes;
};