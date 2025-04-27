import { useEffect, useReducer, useRef } from "react";
import { call_api, updateRecipeList } from "../../utils/utils";
import { ExtendedRecipe } from "../../types";

interface Tag {
  _id: string;
  count: number;
}

interface UsePaginationProps {
  endpoint: string;
  sortOption: string;
  searchQuery?: string; // Search query, if applicable
  searchTrigger?: boolean; // Ensures search only runs when explicitly triggered
  limit?: number;
  resetSearchTrigger: () => void; // Function to reset search trigger
}

// Action types for our reducer
type PaginationAction =
  | { type: "RESET"; payload: { searchQuery: string; sortOption: string } }
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { recipes: ExtendedRecipe[]; currentPage: number; totalPages: number; popularTags: Tag[], totalRecipes: number } }
  | { type: "FETCH_FAILURE" }
  | { type: "INCREMENT_PAGE" }
  | { type: "UPDATE_RECIPES"; payload: { recipe: ExtendedRecipe | null; deleteId?: string } };

// State shape managed by the reducer
interface PaginationState {
  data: ExtendedRecipe[];
  page: number;
  totalPages: number;
  loading: boolean;
  popularTags: Tag[];
  apiCurrentPage: number; // Tracks the last fetched page to avoid redundant calls
  searchQuery: string;
  sortOption: string;
  totalRecipes: number
}

// Initial state factory, using the initial searchQuery and sortOption
const initialState = (searchQuery: string, sortOption: string): PaginationState => ({
  data: [],
  page: 1,
  totalPages: 1,
  loading: false,
  popularTags: [],
  apiCurrentPage: 0,
  searchQuery,
  sortOption,
  totalRecipes: 0
});

// Reducer function to manage state transitions
function reducer(state: PaginationState, action: PaginationAction): PaginationState {
  switch (action.type) {
    case "RESET":
      return {
        ...state,
        data: [],
        page: 1,
        totalPages: 1,
        apiCurrentPage: 0,
        searchQuery: action.payload.searchQuery,
        sortOption: action.payload.sortOption,
        totalRecipes: 0
      };
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        // Append new recipes to the existing list
        data: [...state.data, ...action.payload.recipes],
        page: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        popularTags: state.popularTags.length ? state.popularTags : action.payload.popularTags,
        apiCurrentPage: action.payload.currentPage,
        totalRecipes: action.payload.totalRecipes
      };
    case "FETCH_FAILURE":
      return { ...state, loading: false };
    case "INCREMENT_PAGE":
      return { ...state, page: state.page + 1 };
    case "UPDATE_RECIPES":
      return {
        ...state,
        data: updateRecipeList(state.data, action.payload.recipe, action.payload.deleteId),
      };
    default:
      return state;
  }
}

/**
 * Custom hook to handle paginated fetching of recipes, supporting both normal listing and search.
 */

export const usePagination = ({
  endpoint,
  sortOption,
  searchQuery = "",
  searchTrigger = false,
  limit = 12,
  resetSearchTrigger,
}: UsePaginationProps) => {
  const [state, dispatch] = useReducer(reducer, initialState(searchQuery, sortOption));

  // We'll use this ref to detect when the search or sort parameters change.
  const prevParamsRef = useRef({ endpoint, sortOption, searchQuery });

  // A helper that lets us check conditions for aborting the fetch.
  // We pass in an explicit page (which may be 1 if parameters just changed)
  const shouldAbortFetch = (pageToFetch: number): boolean => {
    if (state.loading) return true;
    if (pageToFetch > state.totalPages) return true;
  
    if (searchQuery.trim()) {
      // In search mode, we only fetch when explicitly triggered,
      // and we avoid fetching the same page twice.
      if (!searchTrigger) return true;
      if (pageToFetch === state.apiCurrentPage) return true;
    } else {
      // In non-search mode, we ignore the searchTrigger flag.
      // However, if searchTrigger is accidentally true (say, on clearing the search),
      // we only allow fetching on page 1.
      if (searchTrigger && pageToFetch !== 1) return true;
      if (pageToFetch === state.apiCurrentPage) return true;
    }
    return false;
  };

  // Merged effect: it handles both resets (when query/sort changes) and normal load-more fetches.
  useEffect(() => {
    // Determine if any parameter has changed.
    let pageToFetch = state.page;
    const paramsChanged =
      prevParamsRef.current.endpoint !== endpoint ||
      prevParamsRef.current.sortOption !== sortOption ||
      prevParamsRef.current.searchQuery !== searchQuery;

    if (paramsChanged) {
      // If parameters have changed, reset the state and force page 1 for fetching.
      dispatch({ type: "RESET", payload: { searchQuery, sortOption } });
      pageToFetch = 1;
      prevParamsRef.current = { endpoint, sortOption, searchQuery };
    }

    if (shouldAbortFetch(pageToFetch)) return;

    const fetchRecipes = async (pageToFetch: number) => {
      dispatch({ type: "FETCH_START" });
      try {
        const apiEndpoint = searchQuery.trim()
          ? `${endpoint}?query=${encodeURIComponent(searchQuery.trim())}&page=${pageToFetch}&limit=${limit}`
          : `${endpoint}?page=${pageToFetch}&limit=${limit}&sortOption=${sortOption}`;

        const { currentPage, popularTags, recipes, totalPages, totalRecipes } = await call_api({ address: apiEndpoint });
        dispatch({
          type: "FETCH_SUCCESS",
          payload: { recipes, currentPage, totalPages, popularTags, totalRecipes },
        });

        // Reset the search trigger after a successful search request.
        resetSearchTrigger();
      } catch (error) {
        console.error("Error fetching recipes:", error);
        dispatch({ type: "FETCH_FAILURE" });
      }
    };

    fetchRecipes(pageToFetch);
    // We include all necessary dependencies so that when parameters or page changes, this effect runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    endpoint,
    sortOption,
    searchQuery,
    searchTrigger,
    state.page,
    state.loading,
    state.totalPages,
    state.apiCurrentPage,
    limit,
    resetSearchTrigger,
  ]);

  // Function to trigger loading more recipes.
  const loadMore = () => {
    dispatch({ type: "INCREMENT_PAGE" });
  };

  // Function to update the recipe list with client-side changes.
  const handleRecipeListUpdate = (recipe: ExtendedRecipe | null, deleteId?: string) => {
    dispatch({ type: "UPDATE_RECIPES", payload: { recipe, deleteId } });
  };

  return {
    data: state.data,
    loading: state.loading,
    popularTags: state.popularTags,
    totalPages: state.totalPages,
    totalRecipes: state.totalRecipes,
    page: state.page,
    loadMore,
    handleRecipeListUpdate,
  };
};
