import { writable } from 'svelte/store';

export type TableColumnSuggestions = {
    enabled: boolean;
    thinking: boolean;
    context?: string | null;
};

export const tableColumnSuggestions = writable<TableColumnSuggestions>({
    enabled: false,
    context: null,
    thinking: false
});
