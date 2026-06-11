<script lang="ts">
    import { IconChevronDown, IconChevronUp, IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Input } from '@appwrite.io/pink-svelte';
    import { Query } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { createEventDispatcher, onMount } from 'svelte';


    export let value = '';
    export let installationId: string;
    export let repositoryId: string;
    export let label = 'Production branch';
    export let placeholder = 'Select branch';
    export let required = false;

    const dispatch = createEventDispatcher();

    let open = false;
    let searchQuery = '';
    let branches: string[] = [];
    let searchResults: string[] = [];
    let offset = 0;
    let hasMore = true;
    let loading = false;
    let searching = false;
    let searchTimer: ReturnType<typeof setTimeout>;
    const LIMIT = 100;

    async function loadBranches(reset = false) {
        if (loading) return;
        loading = true;
        if (reset) {
            branches = [];
            offset = 0;
            hasMore = true;
        }
        const { branches: newBranches, total } = await sdk
            .forProject(page.params.region, page.params.project)
            .vcs.listRepositoryBranches({
                installationId,
                providerRepositoryId: repositoryId,
                queries: [Query.limit(LIMIT), Query.offset(offset)]
            });
        branches = [...branches, ...newBranches.map((b) => b.name)];
        offset += newBranches.length;
        hasMore = branches.length < total;
        loading = false;
    }

    async function searchBranches(query: string) {
        if (!query) {
            searchResults = [];
            searching = false;
            return;
        }
        searching = true;
        const { branches: results } = await sdk
            .forProject(page.params.region, page.params.project)
            .vcs.listRepositoryBranches({
                installationId,
                providerRepositoryId: repositoryId,
                search: query,
                queries: [Query.limit(LIMIT)]
            });

        searchResults = results.map((b) => b.name);
        searching = false;
    }

    function onSearchInput() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => searchBranches(searchQuery), 300);
    }

    function select(branch: string) {
        value = branch;
        open = false;
        searchQuery = '';
        searchResults = [];
        dispatch('select', branch);
    }

    function toggle() {
        open = !open;
        if (open && branches.length === 0) {
            loadBranches();
        }
        if (!open) {
            searchQuery = '';
            searchResults = [];
        }
    }

    $: displayBranches = searchQuery ? searchResults : branches;
</script>

<div class="branch-selector" on:focusout={(e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
        open = false;
        searchQuery = '';
        searchResults = [];
    }
}}>
    <button
        type="button"
        class="selector-trigger"
        class:open
        on:click={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}>
        <span class="selector-value">{value || placeholder}</span>
        <Icon icon={open ? IconChevronUp : IconChevronDown} size="m" />
    </button>

    {#if open}
        <div class="selector-dropdown" role="listbox">
            <div class="selector-search">
                <Icon icon={IconSearch} size="s" />
                <input
                    type="text"
                    bind:value={searchQuery}
                    on:input={onSearchInput}
                    placeholder="Search branches..."
                    autocomplete="off" />
                {#if searchQuery}
                    <button type="button" on:click={() => { searchQuery = ''; searchResults = []; }}>
                        <Icon icon={IconX} size="s" />
                    </button>
                {/if}
            </div>

            <ul class="selector-list">
                {#if searching}
                    <li class="selector-state">Searching...</li>
                {:else if displayBranches.length === 0}
                    <li class="selector-state">No branches found</li>
                {:else}
                    {#each displayBranches as branch}
                        <li
                            role="option"
                            aria-selected={branch === value}
                            class:selected={branch === value}
                            on:click={() => select(branch)}
                            on:keydown={(e) => e.key === 'Enter' && select(branch)}>
                            {branch}
                        </li>
                    {/each}
                    {#if !searchQuery && hasMore}
                        <li class="selector-load-more">
                            <button
                                type="button"
                                disabled={loading}
                                on:click|stopPropagation={() => loadBranches()}>
                                {loading ? 'Loading...' : 'Load more'}
                            </button>
                        </li>
                    {/if}
                {/if}
            </ul>
        </div>
    {/if}
</div>

<style>
    .branch-selector {
        position: relative;
        width: 100%;
    }

    .selector-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--space-3) var(--space-6);
        border: var(--border-width-s) solid var(--border-neutral);
        border-radius: var(--border-radius-s);
        background: var(--bgcolor-neutral-default);
        cursor: pointer;
        line-height: 140%;
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-primary);
    }

    .selector-trigger:hover:not(.open) {
        border-color: var(--border-focus);
    }

    .selector-trigger.open {
        outline: var(--border-width-l) solid var(--border-focus);
    }

    .selector-value {
        flex: 1;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .selector-dropdown {
        position: absolute;
        top: calc(100% + var(--space-2));
        left: 0;
        right: 0;
        z-index: 9001;
        background: var(--bgcolor-neutral-primary);
        border: var(--border-width-s) solid var(--border-neutral);
        border-radius: var(--border-radius-m);
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.03), 0px 4px 4px 0px rgba(0, 0, 0, 0.04);
        overflow: hidden;
    }

    .selector-search {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        border-bottom: var(--border-width-s) solid var(--border-neutral);
    }

    .selector-search input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-primary);
        outline: none;
    }

    .selector-search input::placeholder {
        color: var(--fgcolor-neutral-tertiary);
    }

    .selector-list {
        max-height: 280px;
        overflow-y: auto;
        padding: var(--gap-xxs);
        display: flex;
        flex-direction: column;
        gap: var(--gap-xxxs);
    }

    .selector-list li {
        padding: var(--space-3) var(--space-5);
        border-radius: var(--border-radius-s);
        cursor: pointer;
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-secondary);
        user-select: none;
    }

    .selector-list li:hover,
    .selector-list li.selected {
        background: var(--overlay-neutral-hover);
    }

    .selector-state {
        padding: var(--space-3) var(--space-5);
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-tertiary);
        cursor: default;
    }

    .selector-load-more {
        padding: var(--space-2) var(--space-4);
        text-align: center;
    }

    .selector-load-more button {
        font-size: var(--font-size-s);
        color: var(--fgcolor-interactive-primary);
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--space-2) var(--space-4);
        border-radius: var(--border-radius-s);
        width: 100%;
    }

    .selector-load-more button:hover:not(:disabled) {
        background: var(--overlay-neutral-hover);
    }

    .selector-load-more button:disabled {
        opacity: 0.5;
        cursor: default;
    }
</style>
