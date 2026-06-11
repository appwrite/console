<script lang="ts">
    import { IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Input } from '@appwrite.io/pink-svelte';
    import { Query } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { createEventDispatcher, hasContext } from 'svelte';
    import { createCombobox } from '@melt-ui/svelte';
    import { fly } from 'svelte/transition';

    export let value = '';
    export let installationId: string;
    export let repositoryId: string;
    export let label = 'Production branch';
    export let placeholder = 'Select branch';

    const dispatch = createEventDispatcher();
    const inDialogGroup = hasContext('dialog-group');
    const inPopoverGroup = hasContext('popover-group');

    let branches: string[] = [];
    let loading = false;
    let loaded = false;
    let searchTimer: ReturnType<typeof setTimeout>;

    const {
        elements: { menu, input, option, label: labelEl },
        states: { open, inputValue, touchedInput },
        helpers: { isSelected }
    } = createCombobox({
        forceVisible: true,
        portal: inDialogGroup ? 'dialog[open]' : inPopoverGroup ? 'body' : null,
        onSelectedChange(event) {
            value = event.next?.value ?? value;
            dispatch('select', value);
            return event.next;
        }
    });

    $: if ($touchedInput) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            if ($inputValue) {
                searchBranches($inputValue);
            } else {
                loadBranches();
            }
        }, 300);
    }

    $: installationId, repositoryId, (() => {
        branches = [];
        loaded = false;
    })();

    async function loadBranches() {
        if (loading || loaded || !installationId || !repositoryId) return;
        loading = true;
        try {
            const { branches: result } = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listRepositoryBranches({
                    installationId,
                    providerRepositoryId: repositoryId,
                    queries: [Query.limit(100)]
                });
            branches = result.map((b) => b.name);
            loaded = true;
        } finally {
            loading = false;
        }
    }

    async function searchBranches(query: string) {
        loading = true;
        try {
            const { branches: results } = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listRepositoryBranches({
                    installationId,
                    providerRepositoryId: repositoryId,
                    search: query,
                    queries: [Query.limit(100)]
                });
            branches = results.map((b) => b.name);
        } finally {
            loading = false;
        }
    }

    $: if ($open && !loaded && !loading) {
        loadBranches();
    }

    $: displayBranches = branches;
</script>

<Input.Base id="branch-selector" {label}>
    <div
        class="input"
        class:open={$open}
        use:input>
        <input
            {...$input}
            {placeholder}
            class="input-field" />
        <div class="input-icons">
            {#if $inputValue}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <span
                    role="button"
                    tabindex="0"
                    class="clear-btn"
                    on:click={() => ($inputValue = '')}>
                    <Icon icon={IconX} size="s" />
                </span>
            {:else}
                <Icon icon={IconSearch} size="s" />
            {/if}
        </div>
    </div>
    {#if $open}
        <ul {...$menu} use:menu transition:fly={{ duration: 80 }} class="branch-list">
            {#if loading}
                <li class="state-item">Loading...</li>
            {:else if displayBranches.length === 0}
                <li class="state-item">No branches found</li>
            {:else}
                {#each displayBranches as branch}
                    <li
                        {...$option({ value: branch, label: branch })}
                        use:option
                        class:selected={$isSelected(branch)}>
                        {branch}
                    </li>
                {/each}
                {#if !$inputValue}
                    <li class="hint-item">Type to search all branches</li>
                {/if}
            {/if}
        </ul>
    {/if}
</Input.Base>

<style>
    .input {
        display: flex;
        gap: var(--space-5);
        align-items: center;
        width: 100%;
        border: var(--border-width-s) solid var(--border-neutral);
        border-radius: var(--border-radius-s);
        background-color: var(--bgcolor-neutral-default);
        padding-inline: var(--space-6);
        outline-offset: calc(var(--border-width-s) * -1);
        line-height: 140%;
        user-select: none;
        transition: all 0.15s ease-in-out;
    }

    .input:hover:not(.open) {
        border-color: var(--border-focus);
    }

    .input.open {
        outline: var(--border-width-l) solid var(--border-focus);
    }

    .input-field {
        flex: 1;
        padding-block: var(--space-3);
        border: none;
        background: transparent;
        font-size: var(--font-size-s);
        color: var(--fgcolor-neutral-primary);
        outline: none;
        min-width: 0;
    }

    .input-field::placeholder {
        color: var(--fgcolor-neutral-tertiary);
    }

    .input-icons {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--fgcolor-neutral-tertiary);
    }

    .clear-btn {
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .clear-btn:hover {
        color: var(--fgcolor-neutral-primary);
    }

    .branch-list {
        display: flex;
        padding: var(--gap-xxs);
        flex-direction: column;
        align-items: flex-start;
        gap: var(--gap-xxxs);
        border-radius: var(--border-radius-m);
        border: var(--border-width-s) solid var(--border-neutral);
        background: var(--bgcolor-neutral-primary);
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.03), 0px 4px 4px 0px rgba(0, 0, 0, 0.04);
        z-index: 9001;
        max-height: 300px;
        overflow-y: auto;
        list-style: none;
        margin: 0;
        width: 100%;
    }

    .branch-list li {
        display: flex;
        padding-block: var(--space-3);
        padding-inline: var(--space-5) var(--space-4);
        align-items: center;
        cursor: pointer;
        align-self: stretch;
        border-radius: var(--border-radius-s);
        user-select: none;
        color: var(--fgcolor-neutral-secondary);
        font-size: var(--font-size-s);
        font-style: normal;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .branch-list li:hover,
    .branch-list li[data-highlighted],
    .branch-list li.selected {
        background: var(--overlay-neutral-hover);
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
