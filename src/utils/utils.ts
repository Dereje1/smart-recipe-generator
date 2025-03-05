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
export const updateRecipeList = (
  oldList: ExtendedRecipe[],
  newRecipe: ExtendedRecipe | null,
  deleteId?: string
) => {
  if (!newRecipe && !deleteId) return oldList
  const id = newRecipe ? newRecipe._id : deleteId;
  return newRecipe
    ? oldList.map(recipe => (recipe._id === id ? newRecipe : recipe))
    : oldList.filter(recipe => recipe._id !== id);
};

/**
 * Filters recipes based on a search query.
 * 
 * The function first attempts to find recipes where any tag includes the search term.
 * If any tag matches are found, those recipes are returned exclusively.
 * Otherwise, it falls back to searching within the recipe's name, ingredients, and dietary preferences.
 *
 * @param recipes - The array of recipes to filter.
 * @param search - The search query string.
 * @returns An array of recipes filtered according to the search criteria.
 */
export const getFilteredRecipes = (recipes: ExtendedRecipe[], search: string | null): ExtendedRecipe[] => {
  // If no search term is provided, return all recipes.
  if (!search) return recipes;
  const searchLower = search.toLowerCase();

  // Primary search: filter recipes by checking if any tag contains the search term.
  const tagMatches = recipes.filter(({ tags }) =>
    tags.some(tagObj => tagObj.tag.toLowerCase().includes(searchLower))
  );

  // If there are any tag matches, return them exclusively.
  if (tagMatches.length > 0) {
    return tagMatches;
  }

  // Fallback search: if no tag matches were found, search in name, ingredients, and dietary preferences.
  return recipes.filter(({ name, ingredients, dietaryPreference }) => {
    const nameMatches = name.toLowerCase().includes(searchLower);
    const ingredientMatches = ingredients.some(ingredient => ingredient.name.toLowerCase().includes(searchLower));
    const dietMatches = dietaryPreference.some(diet => diet.toLowerCase().includes(searchLower));

    return nameMatches || ingredientMatches || dietMatches;
  });
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

export const formatDate = (date: string) => {
  const [, day, mth, year] = new Date(date).toUTCString().split(' ');
  return `${day} ${mth} ${year}`;
};

export const playAudio = async (
  audioUrl: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  onEnd?: () => void // Optional callback when audio finishes
): Promise<void> => {
  try {
    const audio = new Audio(audioUrl);
    audio.preload = 'auto'; // Force preloading
    audioRef.current = audio; // Save the audio instance

    // Attach the `ended` event listener
    audio.onended = () => {
      if (onEnd) onEnd(); // Call the callback if provided
    };

    // Explicitly force loading
    audio.load();

    // Wait for the audio to preload
    await new Promise<void>((resolve, reject) => {
      let isResolved = false;

      audio.oncanplaythrough = () => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      };

      audio.onerror = () => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('Error loading audio'));
        }
      };

      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('Audio loading timeout'));
        }
      }, 20000); // 20 seconds timeout
    });

    // Attempt playback
    await audio.play();
  } catch (error: any) {
    console.error(`playAudio: Error playing audio: ${error.message}`);
    throw error;
  }
};





