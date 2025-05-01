<script lang="ts" context="module">
    export let showCreateBucket = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { Empty, PaginationWithLimit, SearchQuery } from '$lib/components';
    import Create from './create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import type { PageData } from './$types';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { columns } from './store';
    import Grid from './grid.svelte';
    import Table from './table.svelte';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { consoleProfile } from '$lib/system';

    export let data: PageData;

    const project = page.params.project;

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        showCreateBucket.set(false);
        await goto(`${base}/project-${project}/storage/bucket-${event.detail.$id}`);
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name or ID" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector
                {columns}
                view={data.view}
                hideColumns={!data.buckets.total}
                hideView={!data.buckets.total} />
            {#if $canWriteBuckets}
                <Button
                    on:mousedown={() => ($showCreateBucket = true)}
                    event="create_bucket"
                    size="s">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create bucket
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
    {#if data.buckets.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreateBucket} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Databases"
            limit={data.limit}
            offset={data.offset}
            total={data.buckets.total} />
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/storage"
            target="bucket"
            description={consoleProfile.hasChat
                ? 'Storage allows you to manage files in your project.'
                : 'Need a hand? Learn more in our documentation.'}
            on:click={() => showCreateBucket.set(true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreateBucket} on:created={bucketCreated} />
