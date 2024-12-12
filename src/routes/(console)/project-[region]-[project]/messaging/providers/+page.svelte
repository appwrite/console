<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        Heading,
        ViewSelector,
        EmptyFilter
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import CreateProviderDropdown from './createProviderDropdown.svelte';
    import Table from './table.svelte';
    import { base } from '$app/paths';
    import { canWriteProviders } from '$lib/stores/roles';

    export let data: PageData;

    let showCreateDropdownMobile = false;
    let showCreateDropdownDesktop = false;
    let showCreateDropdownEmpty = false;
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Heading tag="h2" size="5">Providers</Heading>
            {#if $canWriteProviders}
                <div class="is-only-mobile">
                    <CreateProviderDropdown bind:showCreateDropdown={showCreateDropdownMobile} />
                </div>
            {/if}
        </div>
        <!-- TODO: fix width of search input in mobile -->
        <SearchQuery search={data.search} placeholder="Search provider">
            <div class="u-flex u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <ViewSelector
                    view={data.view}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
                {#if $canWriteProviders}
                    <CreateProviderDropdown bind:showCreateDropdown={showCreateDropdownDesktop} />
                {/if}
            </div>
        </SearchQuery>
        <div class="u-flex u-gap-16 is-only-mobile u-margin-block-start-16">
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <ViewSelector
                    view={data.view}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
            </div>
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <Filters query={data.query} {columns} />
            </div>
        </div>
    </div>
    {#if data.providers.total}
        <Table {data} />

        <PaginationWithLimit
            name="Providers"
            limit={data.limit}
            offset={data.offset}
            total={data.providers.total} />
    {:else if $hasPageQueries}
        <EmptyFilter resource="providers" />
    {:else if data.search && data.search !== 'empty'}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no providers that match your search.</p>
            </div>
            <Button
                secondary
                href={`${base}/project-${$page.params.region}-${$page.params.project}/messaging/providers`}>
                Clear search
            </Button>
        </EmptySearch>
    {:else}
        <Empty single target="provider">
            <div class="u-text-center">
                <Heading size="7" tag="h2" trimmed={false}>
                    Create your first provider to get started.
                </Heading>
                <p class="body-text-2 u-bold u-margin-block-start-4">
                    Need a hand? Learn more in our documentation.
                </p>
            </div>
            <div class="u-flex u-flex-wrap u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/products/messaging/providers"
                    text
                    event="empty_documentation"
                    ariaLabel={`create provider`}>
                    Documentation
                </Button>
                {#if $canWriteProviders}
                    <CreateProviderDropdown bind:showCreateDropdown={showCreateDropdownEmpty}>
                        <Button
                            secondary
                            on:click={() => (showCreateDropdownEmpty = !showCreateDropdownEmpty)}
                            event="create_provider">
                            <span class="text">Create provider</span>
                        </Button>
                    </CreateProviderDropdown>
                {/if}
            </div>
        </Empty>
    {/if}
</Container>
