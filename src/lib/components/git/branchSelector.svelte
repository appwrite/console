<script lang="ts">
    import { IconChevronDown, IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { Query } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { createEventDispatcher, tick } from 'svelte';

    export let value = '';
    export let installationId: string;
    export let repositoryId: string;
    export let label = 'Production branch';
    export let placeholder = 'Select branch';

    const dispatch = createEventDispatcher();

    let open = false;
    let searchQuery = '';
    let branches: string[] = [];
    let searchResults: string[] = [];
    let loading = false;
    let searching = false;
    let searchTimer: ReturnType<typeof setTimeout>;
    let searchInput: HTMLInputElement;
    let containerEl: HTMLDivElement;

    async function loadBranches() {
        if (loading || branches.length > 0) return;
        loading = true;
        const { branches: result } = await sdk
            .forProject(page.params.region, page.params.project)
            .vcs.listRepositoryBranches({
                installationId,
                providerRepositoryId: repositoryId,
                queries: [Query.limit(100)]
            });
        branches = result.map((b) => b.name);
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
                queries: [Query.limit(100)]
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

    async function toggle() {
        open = !open;
        if (open) {
            loadBranches();
            await tick();
            searchInput?.focus();
        } else {
            searchQuery = '';
            searchResults = [];
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            open = false;
            searchQuery = '';
            searchResults = [];
        }
    }

    function handleOutsideClick(e: MouseEvent) {
        if (open && !containerEl.contains(e.target as Node)) {
            open = false;
            searchQuery = '';
            searchResults = [];
        }
    }

    $: displayBranches = searchQuery ? searchResults : branches;
</script>

<svelte:window on:click={handleOutsideClick} on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-label-has-associated-control -->
<div class="branch-selector" bind:this={containerEl}>
    {#if label}
        <label class="label">{label}</label>
    {/if}
    <button
        type="button"
        class="trigger"
        class:open
        on:click={toggle}>
        <span class="trigger-value" class:placeholder={!value}>{value || placeholder}</span>
        <Icon icon={IconChevronDown} size="m" />
    </button>

    {#if open}
        <div class="dropdown">
            <div class="search-header">
                <Icon icon={IconSearch} size="s" />
                <input
                    bind:this={searchInput}
                    bind:value={searchQuery}
                    on:input={onSearchInput}
                    type="text"
                    placeholder="Find a branch..."
                    autocomplete="off" />
                {#if searchQuery}
                    <button
                        type="button"
                        class="clear-btn"
                        on:click={() => { searchQuery = ''; searchResults = []; }}>
                        <Icon icon={IconX} size="s" />
                    </button>
                {/if}
            </div>

            <ul role="listbox" class="branch-list">
                {#if loading}
                    <li class="state-item">Loading...</li>
                {:else if searching}
                    <li class="state-item">Searching...</li>
                {:else if displayBranches.length === 0 && searchQuery}
                    <li class="state-item">No branches found</li>
                {:else if displayBranches.length === 0}
                    <li class="state-item">No branches available</li>
                {:else}
                    {#each displayBranches as branch}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <li
                            role="option"
                            aria-selected={branch === value}
                            class:active={branch === value}
                            on:click={() => select(branch)}>
                            {branch}
                        </li>
                    {/each}
                    {#if !searchQuery}
                        <li class="hint-item">Type to search all branches</li>
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
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .label {
        font-size: var(--font-size-s);
        font-weight: 500;
        color: var(--fgcolor-neutral-primary);
    }

    .trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--space-3) var(--space-6);
        border: var(--border-width-s) solid var(--border-neutral);
        border-radius: var(--border-radius-s);
        background: var(--bgcolor-neutral-default);
        cursor: pointer;
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-primary);
        transition: border-color 0.15s ease;
        line-height: 140%;
    }

    .trigger:hover {
        border-color: var(--border-focus);
    }

    .trigger.open {
        outline: var(--border-width-l) solid var(--border-focus);
        border-color: var(--border-focus);
    }

    .trigger-value {
        flex: 1;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .trigger-value.placeholder {
        color: var(--fgcolor-neutral-tertiary);
    }

    .dropdown {
        position: absolute;
        top: calc(100% + var(--space-2));
        left: 0;
        right: 0;
        z-index: 9001;
        background: var(--bgcolor-neutral-primary);
        border: var(--border-width-s) solid var(--border-neutral);
        border-radius: var(--border-radius-m);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        overflow: hidden;
    }

    .search-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-5);
        border-bottom: var(--border-width-s) solid var(--border-neutral);
    }

    .search-header input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-primary);
        outline: none;
    }

    .search-header input::placeholder {
        color: var(--fgcolor-neutral-tertiary);
    }

    .clear-btn {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: var(--fgcolor-neutral-tertiary);
    }

    .clear-btn:hover {
        color: var(--fgcolor-neutral-primary);
    }

    .branch-list {
        max-height: 300px;
        overflow-y: auto;
        padding: var(--space-2) 0;
        list-style: none;
        margin: 0;
    }

    .branch-list::-webkit-scrollbar {
        width: 4px;
    }

    .branch-list::-webkit-scrollbar-track {
        background: transparent;
        margin-block: 6px;
    }

    .branch-list::-webkit-scrollbar-thumb {
        background: var(--border-neutral);
        border-radius: 2px;
    }

    .branch-list li {
        padding: var(--space-2) var(--space-5);
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-secondary);
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .branch-list li:hover {
        background: var(--overlay-neutral-hover);
        color: var(--fgcolor-neutral-primary);
    }

    .branch-list li.active {
        background: var(--overlay-neutral-hover);
        color: var(--fgcolor-neutral-primary);
        font-weight: 500;
    }

    .state-item {
        padding: var(--space-3) var(--space-5) !important;
        color: var(--fgcolor-neutral-tertiary) !important;
        cursor: default !important;
        font-size: var(--font-size-s);
    }

    .state-item:hover {
        background: transparent !important;
    }

    .hint-item {
        padding: var(--space-3) var(--space-5);
        font-size: var(--font-size-xs);
        color: var(--fgcolor-neutral-tertiary);
        cursor: default;
        border-top: var(--border-width-s) solid var(--border-neutral);
        margin-top: var(--space-1);
    }

    .hint-item:hover {
        background: transparent !important;
    }
</style>
