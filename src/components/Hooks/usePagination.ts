import { useState, useEffect } from "react";
import { call_api, updateRecipeList } from "../../utils/utils";
import { ExtendedRecipe } from '../../types';

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

/**
 * Custom hook to handle paginated fetching of recipes, supporting both normal listing and search.
 */
export const usePagination = ({
    endpoint,
    sortOption,
    searchQuery = "",
    searchTrigger = false,
    limit = 12,
    resetSearchTrigger
}: UsePaginationProps) => {
    const [data, setData] = useState<ExtendedRecipe[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [popularTags, setPopularTags] = useState<Tag[]>([]);
    const [apiCurrentPage, setApiCurrentPage] = useState(0)

    useEffect(() => {
        // Reset state when key dependencies change.
        setData([]);
        setPage(1);
        setTotalPages(1);
        setApiCurrentPage(0);
    }, [endpoint, sortOption, searchQuery]);

    useEffect(() => {
        // Helper function to determine if we should abort the fetch.
        const shouldAbortFetch = () => {
            // Prevent a stale API call when exiting search mode.
            if (!searchQuery.trim() && searchTrigger && page !== 1) return true;
            if (loading) return true;
            if (page > totalPages) return true;
            if (searchQuery && !searchTrigger) return true;
            if (page === apiCurrentPage && !searchTrigger) return true;
            return false;
        };

        if (shouldAbortFetch()) return;

        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const apiEndpoint = searchQuery.trim()
                    ? `/api/search-recipes?query=${encodeURIComponent(
                        searchQuery
                    )}&page=${page}&limit=${limit}`
                    : `${endpoint}?page=${page}&limit=${limit}&sortOption=${sortOption}`;

                const {
                    currentPage,
                    popularTags: newPopularTags,
                    recipes,
                    totalPages: newTotalPages,
                } = await call_api({ address: apiEndpoint });

                setData((prev) => [...prev, ...recipes]); // Append new results
                setTotalPages(newTotalPages);
                setPopularTags(newPopularTags);
                setApiCurrentPage(currentPage);

                // Reset search trigger after first successful search request.
                if (searchTrigger) {
                    resetSearchTrigger();
                }
            } catch (error) {
                console.error("Error fetching recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, sortOption, page, searchQuery, searchTrigger]);

    const handleRecipeListUpdate = (r: ExtendedRecipe | null, deleteId?: string) => {
        setData((prev) => updateRecipeList(prev, r, deleteId)); // update with client changes
    }
    return {
        data,
        loading,
        popularTags,
        totalPages,
        loadMore: () => setPage((prev) => prev + 1), // Function to trigger next page
        handleRecipeListUpdate
    };
};
