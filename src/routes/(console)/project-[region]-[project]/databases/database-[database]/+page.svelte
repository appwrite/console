<script lang="ts">
    import { PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import { columns, showCreate } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { canWriteCollections } from '$lib/stores/roles';
    import { Card, Empty, Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';

    export let data: PageData;
</script>

<Container>
    <ResponsiveContainerHeader
        bind:view={data.view}
        {columns}
        hasSearch
        searchPlaceholder="Search by name or ID">
        {#if $canWriteCollections}
            <Button on:click={() => ($showCreate = true)} event="create_collection">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create collection
            </Button>
        {/if}
    </ResponsiveContainerHeader>

    {#if data.collections.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreate} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Collections"
            limit={data.limit}
            offset={data.offset}
            total={data.collections.total} />
    {:else}
        <Card.Base padding="none">
            <Empty title="Create your first table" src={`${base}/images/empty-database-light.svg`}>
                <span slot="description">
                    Create and manage structured data effortlessly, with the flexibility and control
                    your app needs.
                </span>
                <span slot="actions">
                    <Button
                        external
                        text
                        event="empty_documentation"
                        ariaLabel={`create collection`}>Documentation</Button>

                    <Button
                        secondary
                        on:click={() => {
                            $showCreate = true;
                        }}>
                        Create collection
                    </Button>
                </span>
            </Empty>
        </Card.Base>
    {/if}
</Container>
