<script lang="ts">
    import {
        IconChevronDown,
        IconChevronUp,
        IconSearch,
        IconX
    } from '@appwrite.io/pink-icons-svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { Query } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { createEventDispatcher, hasContext, tick, untrack } from 'svelte';
    import { getVcsInstallationErrorKind } from '$lib/helpers/vcsError';
    import { installation, installations } from '$lib/stores/vcs';
    import InstallationError from './installationError.svelte';

    type Props = {
        value?: string;
        installationId: string;
        repositoryId: string;
        label?: string;
        placeholder?: string;
        /**
         * Set to `false` when the surrounding surface already renders its own
         * installation alert for the same installation, so the user is not shown
         * the same "Reconnect" warning twice. The in-list error state stays
         * either way: the branch list must never read as "no branches".
         */
        showInstallationError?: boolean;
    };

    let {
        value = $bindable(''),
        installationId,
        repositoryId,
        label = 'Production branch',
        placeholder = 'Select branch',
        showInstallationError = true
    }: Props = $props();

    // Deprecated in Svelte 5 but kept deliberately: every call site listens with
    // `on:select`, and none of them are in scope here.
    const dispatch = createEventDispatcher<{ select: string }>();
    const inDialogGroup = hasContext('dialog-group');

    let open = $state(false);
    let searchQuery = $state('');
    let branches = $state<string[]>([]);
    let searchResults = $state<string[]>([]);
    let loading = $state(false);
    let searching = $state(false);
    /**
     * The last failure from the branch endpoints. Without it a dead installation
     * token renders as a successful empty list ("No branches available"), which
     * is the opposite of what happened.
     */
    let error = $state<unknown>(null);
    /** Repository the cached `branches` belong to, or `null` when nothing loaded. */
    let loadedFor = $state<string | null>(null);
    let searchTimer: ReturnType<typeof setTimeout>;
    let searchInput = $state<HTMLInputElement>();
    let containerEl = $state<HTMLDivElement>();
    let dropdownRect = $state({ top: 0, left: 0, width: 0 });

    const repositoryKey = $derived(`${installationId}:${repositoryId}`);
    const errorKind = $derived(getVcsInstallationErrorKind(error));
    const displayBranches = $derived(searchQuery ? searchResults : branches);

    /**
     * Provider and owner for the reconnect alert. Every route that renders a
     * branch selector loads `page.data.installations`; the writable store covers
     * the surfaces that pick an installation client side.
     */
    const installationDetails = $derived(
        $installations?.installations?.find((entry) => entry.$id === installationId) ??
            ($installation?.$id === installationId ? $installation : undefined)
    );

    /**
     * When the list could not be loaded the typed query is the only way left to
     * name a branch, so it is offered as a selectable value. Only in the error
     * state: with a working list, committing an unverified name would be wrong.
     */
    const typedBranch = $derived(error ? searchQuery.trim() : '');

    function portal(node: HTMLElement) {
        const target = inDialogGroup ? document.querySelector('dialog[open]') : document.body;
        target?.appendChild(node);
        return {
            destroy() {
                node.parentNode?.removeChild(node);
            }
        };
    }

    function updateRect() {
        if (!containerEl) return;
        const rect = containerEl.getBoundingClientRect();
        dropdownRect = { top: rect.bottom + 4, left: rect.left, width: rect.width };
    }

    $effect(() => {
        // Cached branches and any recorded failure belong to the repository they
        // were loaded for, so a change to either id throws them away. Only the
        // key is tracked: reading `loadedFor` reactively would re-run this on
        // every load and wipe the failure it had just recorded.
        const key = repositoryKey;
        untrack(() => {
            if (loadedFor === key) return;
            branches = [];
            searchResults = [];
            error = null;
            loadedFor = null;
        });
    });

    async function loadBranches(force = false) {
        const key = repositoryKey;
        if (loading || (!force && loadedFor === key) || !installationId || !repositoryId) return;
        loading = true;
        error = null;
        try {
            const { branches: result } = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listRepositoryBranches({
                    installationId,
                    providerRepositoryId: repositoryId,
                    queries: [Query.limit(100)]
                });
            branches = result.map((b) => b.name);
            loadedFor = key;
        } catch (e) {
            error = e;
            branches = [];
            loadedFor = null;
        } finally {
            loading = false;
        }
    }

    async function searchBranches(query: string) {
        if (!query) {
            searchResults = [];
            searching = false;
            // A failed search must not outlive the query that caused it. When
            // the base list never loaded there is nothing underneath to fall
            // back to, so fetch it rather than showing a bare empty list.
            if (loadedFor === repositoryKey) {
                error = null;
            } else {
                loadBranches();
            }
            return;
        }
        searching = true;
        try {
            const { branches: results } = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listRepositoryBranches({
                    installationId,
                    providerRepositoryId: repositoryId,
                    search: query,
                    queries: [Query.limit(100)]
                });
            searchResults = results.map((b) => b.name);
            // Cleared on success only, so a failed load keeps explaining itself
            // (and keeps the typed value selectable) while the search is running.
            error = null;
        } catch (e) {
            error = e;
            searchResults = [];
        } finally {
            searching = false;
        }
    }

    function onSearchInput() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => searchBranches(searchQuery), 300);
    }

    function onSearchKeydown(event: KeyboardEvent) {
        if (event.key !== 'Enter' || !typedBranch) return;
        event.preventDefault();
        select(typedBranch);
    }

    function clearSearch() {
        clearTimeout(searchTimer);
        searchQuery = '';
        searchResults = [];
        searching = false;
        // Same reasoning as searchBranches, but only while the dropdown is
        // open: the close paths call this too, and reloading then is wasted.
        if (loadedFor === repositoryKey) {
            error = null;
        } else if (open) {
            loadBranches();
        }
    }

    function retry() {
        error = null;
        if (searchQuery) {
            clearTimeout(searchTimer);
            searchBranches(searchQuery);
            return;
        }
        loadBranches(true);
    }

    function select(branch: string) {
        value = branch;
        open = false;
        clearSearch();
        dispatch('select', branch);
    }

    async function toggle() {
        open = !open;
        if (open) {
            updateRect();
            loadBranches();
            await tick();
            searchInput?.focus();
        } else {
            clearSearch();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            open = false;
            clearSearch();
        }
    }

    function handleOutsideClick(e: MouseEvent) {
        if (open && !containerEl?.contains(e.target as Node)) {
            const dropdown = document.querySelector('.branch-selector-portal');
            if (dropdown && dropdown.contains(e.target as Node)) return;
            open = false;
            clearSearch();
        }
    }
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeydown} />

<div class="branch-selector" bind:this={containerEl}>
    {#if label}
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="label">{label}</label>
    {/if}
    <button type="button" class="trigger" class:open onclick={toggle}>
        <span class="trigger-value" class:muted={!value}>{value || placeholder}</span>
        <Icon icon={open ? IconChevronUp : IconChevronDown} size="m" />
    </button>

    {#if errorKind && showInstallationError}
        <InstallationError
            kind={errorKind}
            provider={installationDetails?.provider}
            organization={installationDetails?.organization}
            onRetry={retry} />
    {/if}

    {#if open}
        <div
            class="dropdown branch-selector-portal"
            use:portal
            style="position: fixed; top: {dropdownRect.top}px; left: {dropdownRect.left}px; width: {dropdownRect.width}px; z-index: 9001;">
            <div class="search-header">
                <Icon icon={IconSearch} size="s" />
                <input
                    bind:this={searchInput}
                    bind:value={searchQuery}
                    oninput={onSearchInput}
                    onkeydown={onSearchKeydown}
                    type="text"
                    placeholder="Find a branch..."
                    autocomplete="off" />
                {#if searchQuery}
                    <button type="button" class="clear-btn" onclick={clearSearch}>
                        <Icon icon={IconX} size="s" />
                    </button>
                {/if}
            </div>
            <ul role="listbox" class="branch-list">
                {#if loading}
                    <li class="state-item">Loading...</li>
                {:else if searching}
                    <li class="state-item">Searching...</li>
                {:else if error}
                    <!-- Never claim the repository has no branches when the call failed. -->
                    <li class="state-item">Branches could not be loaded</li>
                    {#if typedBranch}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <li
                            role="option"
                            aria-selected={typedBranch === value}
                            onclick={() => select(typedBranch)}>
                            Use "{typedBranch}"
                        </li>
                    {:else}
                        <li class="hint-item">Type a branch name to use it anyway</li>
                    {/if}
                {:else if displayBranches.length === 0 && searchQuery}
                    <li class="state-item">No branches found</li>
                {:else if displayBranches.length === 0}
                    <li class="state-item">No branches available</li>
                {:else}
                    {#each displayBranches as branch}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <li
                            role="option"
                            aria-selected={branch === value}
                            class:active={branch === value}
                            onclick={() => select(branch)}>
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
        overflow: visible;
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
    .trigger-value.muted {
        color: var(--fgcolor-neutral-tertiary);
    }

    .dropdown {
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

    .branch-list li:hover,
    .branch-list li.active {
        background: var(--overlay-neutral-hover);
        color: var(--fgcolor-neutral-primary);
    }
    .branch-list li.active {
        font-weight: 500;
    }

    .state-item {
        color: var(--fgcolor-neutral-tertiary) !important;
        cursor: default !important;
    }
    .state-item:hover {
        background: transparent !important;
    }

    .hint-item {
        font-size: var(--font-size-xs);
        color: var(--fgcolor-neutral-tertiary);
        cursor: default;
        border-top: var(--border-width-s) solid var(--border-neutral);
        margin-top: var(--space-1);
        padding-top: var(--space-2);
    }

    .hint-item:hover {
        background: transparent !important;
    }
</style>
