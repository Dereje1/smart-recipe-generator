import { useState, useEffect } from "react";
import { call_api } from "../../utils/utils";
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

    useEffect(() => {
        // Reset data when sorting option or endpoint changes, but not when only the page updates
        setData([]);
        setPage(1);
        setTotalPages(1);
    }, [sortOption, endpoint, searchQuery]); // 🔹 Resets when sorting or search starts

    useEffect(() => {
        const fetchRecipes = async () => {
            if (loading || page > totalPages || (searchQuery && !searchTrigger)) return;
            setLoading(true);

            try {
                const apiEndpoint = searchQuery.trim()
                    ? `/api/search-recipes?query=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`
                    : `${endpoint}?page=${page}&limit=${limit}&sortOption=${sortOption}`;

                const {
                    currentPage,
                    popularTags: newPopularTags,
                    recipes,
                    totalPages: newTotalPages,
                } = await call_api({ address: apiEndpoint });

                setData((prev) => [...prev, ...recipes]); // Append new results
                setTotalPages(newTotalPages);
                setPopularTags(newPopularTags); // Update popular tags
                // Reset search trigger after first successful search request
                if (searchTrigger) {
                    resetSearchTrigger();
                }
            } catch (error) {
                console.error("Error fetching recipes:", error);
            }

            setLoading(false);
        };

        fetchRecipes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, sortOption, page, searchQuery, searchTrigger]); // 🔹 Only fetch if search is confirmed

    return {
        data,
        loading,
        popularTags,
        totalPages,
        loadMore: () => setPage((prev) => prev + 1), // Function to trigger next page
    };
};
