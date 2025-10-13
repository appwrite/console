/**
 * Creates a clear search function for SearchQuery components
 * @param searchQuery
 * @returns A function that clears the search input
 */
export function createClearSearch(searchQuery: { clearInput?: () => void } | undefined) {
    return () => {
        searchQuery?.clearInput?.();
    };
}

/**
 * @param searchQuery
 */
export function clearSearchInput(searchQuery: { clearInput?: () => void } | undefined) {
    searchQuery?.clearInput?.();
}
