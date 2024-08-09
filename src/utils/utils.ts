import axios from "axios";
import { getSession } from 'next-auth/react';
import { ExtendedRecipe } from "../types";
import { GetServerSidePropsContext } from "next";

// Filters the results by enhancing recipe information with ownership and liked status for the user
export const filterResults = (recipes: ExtendedRecipe[], userId: string) => {
  return recipes.map((recipe) => (
    {
      ...recipe,
      owner: {
        _id: recipe.owner._id,
        name: recipe.owner.name,
        image: recipe.owner.image
      },
      likedBy: recipe.likedBy.map(({ _id, name, image }) => ({ _id, name, image })), // Simplifies likedBy list
      owns: recipe.owner._id.toString() === userId, // Flags if the recipe belongs to the user
      liked: recipe.likedBy.some(l => l._id.toString() === userId) // Flags if the user liked the recipe
    }
  ))
}

// Updates the recipe list by either replacing or removing a recipe from the list
export const updateRecipeList = (oldList: ExtendedRecipe[], newRecipe: ExtendedRecipe | null, deleteId?: string) => {
  const indexOfUpdate = oldList.findIndex((p) => p._id === (newRecipe ? newRecipe._id : deleteId));
  return newRecipe ? [
    ...oldList.slice(0, indexOfUpdate), // Preserves recipes before the updated one
    newRecipe, // Inserts the updated recipe
    ...oldList.slice(indexOfUpdate + 1), // Preserves recipes after the updated one
  ] : [
    ...oldList.slice(0, indexOfUpdate), // Preserves recipes before the deleted one
    ...oldList.slice(indexOfUpdate + 1), // Removes the deleted recipe
  ];
};

// Filters recipes based on search criteria in name, ingredients, or dietary preferences
export const getFilteredRecipes = (recipes: ExtendedRecipe[], search: string | null) => {
  if (!search) return recipes;
  const filteredRecipes = recipes.filter(({ name, ingredients, dietaryPreference }) => {
    const isFoundInName = name.toLowerCase().includes(search); // Matches search with recipe name
    const isFoundInIngredients = ingredients.filter(ingredient => ingredient.name.toLowerCase().includes(search)); // Matches search with ingredients
    const isFoundInDiets = dietaryPreference.filter(diet => diet.toLowerCase().includes(search)); // Matches search with dietary preferences
    return isFoundInName || Boolean(isFoundInIngredients.length) || Boolean(isFoundInDiets.length);
  });
  return filteredRecipes;
};

// Utility to fetch data on server-side while ensuring user authentication
export const getServerSidePropsUtility = async (context: GetServerSidePropsContext, address: string, propskey: string = 'recipes') => {
  try {
    const session = await getSession(context);
    if (!session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${address}`, {
      headers: {
        Cookie: context.req.headers.cookie || '',
      },
    });
    return {
      props: {
        [propskey]: data,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch ${propskey}:`, error); // Logs errors in fetching data
    return {
      props: {
        [propskey]: [], // Returns an empty list if there's an error
      },
    };
  }
};

// REST API call utility supporting multiple HTTP methods
interface methods {
  put: 'put';
  post: 'post';
  delete: 'delete';
  get: 'get';
}

interface RESTcallTypes {
  address: string;
  method?: keyof methods;
  payload?: {
    [key: string]: any;
  };
}

export const call_api = async ({ address, method = 'get', payload }: RESTcallTypes) => {
  try {
    const { data } = await axios[method as keyof methods](address, payload);
    return data; // Returns the data from the API call
  } catch (error) {
    console.error(`An error occurred making a ${method} REST call to -> ${address} error -> ${error}`);
    throw (error); // Rethrows the error for further handling
  }
};
