import { renderHook, act } from "@testing-library/react";
import { usePagination } from "../../../src/components/Hooks/usePagination";
import { call_api } from "../../../src/utils/utils";

jest.mock("../../../src/utils/utils", () => ({
    call_api: jest.fn(),
}));

describe("usePagination", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("initial state is set correctly", async () => {
        (call_api as jest.Mock).mockResolvedValue({
            recipes: [{ id: 1, title: "Test Recipe" }],
            totalPages: 2,
            popularTags: [{ _id: "pasta", count: 5 }],
        });
        const { result } = renderHook(() =>
            usePagination({
                endpoint: "/api/get-recipes",
                sortOption: "popular",
                resetSearchTrigger: jest.fn(),
            })
        );
        await act(async () => { }); // Wait for any pending effects
        expect(result.current.data).toEqual([{ id: 1, title: "Test Recipe" }]);
        expect(result.current.loading).toBe(false);
        expect(result.current.popularTags).toEqual([{ _id: "pasta", count: 5 }]);
    });

    test("fetches recipes on mount and updates state", async () => {
        (call_api as jest.Mock).mockResolvedValue({
            recipes: [{ id: 1, title: "Test Recipe" }],
            totalPages: 2,
            popularTags: [{ _id: "pasta", count: 5 }],
        });

        const { result } = renderHook(() =>
            usePagination({
                endpoint: "/api/get-recipes",
                sortOption: "popular",
                resetSearchTrigger: jest.fn(),
            })
        );

        expect(result.current.loading).toBe(true);

        await act(async () => { });

        expect(result.current.data).toEqual([{ id: 1, title: "Test Recipe" }]);
        expect(result.current.totalPages).toBe(2);
        expect(result.current.popularTags).toEqual([{ _id: "pasta", count: 5 }]);
        expect(result.current.loading).toBe(false);
    });

    test("triggers search when searchTrigger is true", async () => {
        (call_api as jest.Mock).mockResolvedValue({
            recipes: [{ id: 2, title: "Search Result" }],
            totalPages: 1,
            popularTags: [{ _id: "vegan", count: 3 }],
            currentPage: 1
        });

        const resetSearchTriggerMock = jest.fn();

        const { result } = renderHook(() =>
            usePagination({
                endpoint: "/api/search-recipes",
                sortOption: "recent",
                searchQuery: "vegan",
                searchTrigger: true,
                resetSearchTrigger: resetSearchTriggerMock,
            })
        );

        await act(async () => { });

        expect(call_api).toHaveBeenCalledWith({
            address: "/api/search-recipes?query=vegan&page=1&limit=12",
        });

        expect(result.current.data).toEqual([{ id: 2, title: "Search Result" }]);
        expect(resetSearchTriggerMock).toHaveBeenCalled();
    });

    test("does not trigger search when searchTrigger is false", async () => {
        (call_api as jest.Mock).mockResolvedValue({});

        const { result } = renderHook(() =>
            usePagination({
                endpoint: "/api/search-recipes",
                sortOption: "recent",
                searchQuery: "vegan",
                searchTrigger: false,
                resetSearchTrigger: jest.fn(),
            })
        );

        await act(async () => { });

        expect(call_api).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
    });

    test("loads more recipes when loadMore is called", async () => {
        (call_api as jest.Mock)
            .mockResolvedValueOnce({
                recipes: [{ id: 1, title: "First Page Recipe" }],
                totalPages: 2,
                popularTags: [{ _id: "pasta", count: 5 }],
            })
            .mockResolvedValueOnce({
                recipes: [{ id: 2, title: "Next Page Recipe" }], // ✅ Different data for page 2
                totalPages: 2,
                popularTags: [{ _id: "pasta", count: 5 }],
            });

        const { result } = renderHook(() =>
            usePagination({
                endpoint: "/api/get-recipes",
                sortOption: "recent",
                resetSearchTrigger: jest.fn(),
            })
        );
        // First wait for original page to load
        await act(async () => { });
        // Then load more
        await act(async () => {
            result.current.loadMore();
        });

        expect(call_api).toHaveBeenCalledWith({
            address: "/api/get-recipes?page=1&limit=12&sortOption=recent",
        });

        expect(result.current.data).toEqual([{ "id": 1, "title": "First Page Recipe" }, { "id": 2, "title": "Next Page Recipe" }]);
    });
});
