<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
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
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { View } from '$lib/helpers/load';

    export let data: PageData;

    let showCreateDropdownEmpty = false;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery search={data.search} placeholder="Search providers" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Filters query={data.query} {columns} analyticsSource="messaging_providers" />
            <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
            {#if $canWriteProviders}
                <CreateProviderDropdown />
            {/if}
        </Layout.Stack>
    </Layout.Stack>

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
            <Button secondary href={`${base}/project-${$page.params.project}/messaging/providers`}>
                Clear search
            </Button>
        </EmptySearch>
    {:else}
        <Empty single target="provider">
            <div class="u-text-center">
                <Typography.Title size="s">
                    Create your first provider to get started.
                </Typography.Title>
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
                    <CreateProviderDropdown>
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
