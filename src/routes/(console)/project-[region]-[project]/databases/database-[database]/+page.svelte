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
    import { canWriteTables } from '$lib/stores/roles';

    export let data: PageData;
</script>

<Container expanded slotSpacing paddingInlineEnd={false}>
    {#if data.tables.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreate} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Tables"
            limit={data.limit}
            offset={data.offset}
            total={data.tables.total} />
    {:else}
        <Card.Base padding="none">
            <Empty
                title="Create your first table"
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/empty-database-dark.svg`
                    : `${base}/images/empty-database-light.svg`}>
                <span slot="description">
                    Create, organize, and query structured data with Tables.
                </span>
                <span slot="actions">
                    <Button external text event="empty_documentation" ariaLabel={`create table`}
                        >Documentation</Button>

                    {#if $canWriteTables}
                        <Button
                            secondary
                            on:click={() => {
                                $showCreate = true;
                            }}>
                            Create table
                        </Button>
                    {/if}
                </span>
            </Empty>
        </Card.Base>
    {/if}
</Container>
