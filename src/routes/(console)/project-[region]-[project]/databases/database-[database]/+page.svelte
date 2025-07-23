<script lang="ts">
    import { PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { showCreate } from './store';
    import Table from './table.svelte';
    import Grid from './grid.svelte';
    import type { PageData } from './$types';
    import { Card, Empty } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { canWriteCollections } from '$lib/stores/roles';

    export let data: PageData;
</script>

<Container expanded slotSpacing paddingInlineEnd={false}>
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
            <Empty
                title="Create your first table"
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/empty-database-dark.svg`
                    : `${base}/images/empty-database-light.svg`}>
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

                    {#if $canWriteCollections}
                        <Button
                            secondary
                            on:click={() => {
                                $showCreate = true;
                            }}>
                            Create collection
                        </Button>
                    {/if}
                </span>
            </Empty>
        </Card.Base>
    {/if}
</Container>
