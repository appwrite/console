<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import {
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        ViewSelector,
        EmptyFilter
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { columns } from './store';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import CreateProviderDropdown from './createProviderDropdown.svelte';
    import Table from './table.svelte';
    import { canWriteProviders } from '$lib/stores/roles';
    import { Card, Layout, Empty, Icon } from '@appwrite.io/pink-svelte';
    import { View } from '$lib/helpers/load';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { clearSearchInput } from '$lib/helpers/clearSearch';

    export let data;

    let searchQuery;
    const clearSearch = () => clearSearchInput(searchQuery);
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery bind:this={searchQuery} placeholder="Search providers" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Filters query={data.query} {columns} analyticsSource="messaging_providers" />
            <ViewSelector ui="new" view={View.Table} {columns} hideView />
            {#if $canWriteProviders}
                <CreateProviderDropdown let:toggle>
                    <Button on:click={toggle} event="create_provider">
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Create provider
                    </Button>
                </CreateProviderDropdown>
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
        <EmptySearch target="providers" search={data.search}>
            <Button secondary on:click={clearSearch}>Clear search</Button>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                title="Create your first provider"
                description="Need a hand? Learn more in our documentation.">
                <slot name="actions" slot="actions">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/messaging/providers"
                        text
                        event="empty_documentation"
                        size="s">Documentation</Button>
                    {#if $canWriteProviders}
                        <CreateProviderDropdown let:toggle>
                            <Button on:click={toggle} event="create_provider" secondary>
                                Create provider
                            </Button>
                        </CreateProviderDropdown>
                    {/if}
                </slot>
            </Empty>
        </Card.Base>
    {/if}
</Container>
