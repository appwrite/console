<script lang="ts">
    import { SearchQuery, ViewSelector } from '$lib/components';
    import { ParsedTagList } from '$lib/components/filters';
    import QuickFilters from '$lib/components/filters/quickFilters.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconAdjustments, IconFilterLine, IconSearch } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import type { Snippet } from 'svelte';
    import type { Writable } from 'svelte/store';
    import DisplaySettingsModal from './displaySettingsModal.svelte';

    let {
        columns,
        view = View.Table,
        hideView = false,
        hideColumns = false,
        hasSearch = false,
        searchPlaceholder = 'Search by ID',
        hasFilters = false,
        analyticsSource = '',
        children
    }: {
        columns?: Writable<Column[]>;
        view?: View;
        hideView?: boolean;
        hideColumns?: boolean;
        hasSearch?: boolean;
        searchPlaceholder?: string;
        hasFilters?: boolean;
        analyticsSource?: string;
        children?: Snippet;
    } = $props();

    let hasDisplaySettings = $derived(!hideView || (!hideColumns && $columns?.length));
    let numberOfOptions = $derived(
        [hasSearch, hasFilters && $columns?.length, hasDisplaySettings].filter(Boolean).length
    );
    let showSearch = $state(false);
    let showDisplaySettingsModal = $state(false);
    let showFilters = $state(false);
</script>

<header>
    <Layout.Stack>
        {#if $isSmallViewport}
            <Layout.Stack gap="xl">
                <Layout.Stack direction="row">
                    <div style={`--button-width: 100%; width: 100%`}>
                        {@render children()}
                    </div>
                    {#if numberOfOptions === 1}
                        {#if hasSearch}
                            {@render searchButton(true)}
                        {:else if hasFilters && $columns?.length}
                            {@render filtersButton(true)}
                        {:else if hasDisplaySettings}
                            {@render settingsButton(true)}
                        {/if}
                    {/if}
                </Layout.Stack>
                {#if numberOfOptions > 1}
                    <Layout.Stack
                        direction="row"
                        gap="s"
                        style={`--button-width: calc(${100 / numberOfOptions}% - var(--gap-s) / 2)`}>
                        {#if hasSearch}
                            {@render searchButton()}
                        {/if}
                        {#if hasFilters && $columns?.length}
                            {@render filtersButton()}
                        {/if}
                        {#if hasDisplaySettings}
                            {@render settingsButton()}
                        {/if}
                    </Layout.Stack>
                {/if}

                {#if showSearch && hasSearch}
                    <SearchQuery placeholder={searchPlaceholder} />
                {/if}
            </Layout.Stack>
        {:else}
            <Layout.Stack direction="row" justifyContent="space-between">
                <Layout.Stack direction="row" alignItems="center">
                    {#if hasSearch}
                        <SearchQuery placeholder={searchPlaceholder} />
                    {/if}
                    {#if hasFilters && $columns?.length}
                        <QuickFilters {columns} {analyticsSource} />
                    {/if}
                </Layout.Stack>
                <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
                    {#if hasDisplaySettings}
                        <ViewSelector {view} {columns} {hideView} {hideColumns} />
                    {/if}
                    {@render children()}
                </Layout.Stack>
            </Layout.Stack>
        {/if}
        <ParsedTagList />
    </Layout.Stack>
</header>

{#snippet searchButton(icon = false)}
    <Button ariaLabel="Search" on:click={() => (showSearch = !showSearch)} secondary {icon}>
        <Icon icon={IconSearch} />
    </Button>
{/snippet}

{#snippet settingsButton(icon = false)}
    <Button
        ariaLabel="Display settings"
        on:click={() => (showDisplaySettingsModal = !showDisplaySettingsModal)}
        secondary
        {icon}>
        <Icon icon={IconAdjustments} />
    </Button>
{/snippet}

{#snippet filtersButton(icon = false)}
    <Button ariaLabel="Filters" on:click={() => (showFilters = !showFilters)} secondary {icon}>
        <Icon icon={IconFilterLine} />
    </Button>
{/snippet}

{#if showDisplaySettingsModal}
    <DisplaySettingsModal
        bind:show={showDisplaySettingsModal}
        {columns}
        {hideColumns}
        {hideView}
        bind:view />
{/if}
