import axios from "axios";
import { getSession } from 'next-auth/react';
import { ExtendedRecipe, PaginationQueryType } from "../types";
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

export const paginationQueryHelper = (queryObj: PaginationQueryType) => {
  const page = Number(queryObj.page) || 1;
  const limit = Number(queryObj.limit) || 12; // Default: 12 recipes per page
  const skip = (page - 1) * limit;
  const sortOption = typeof queryObj.sortOption === 'string' ? queryObj.sortOption : 'popular';
  const query = typeof queryObj.query === 'string' ? queryObj.query : undefined;

  return { page, limit, skip, sortOption, query };
};