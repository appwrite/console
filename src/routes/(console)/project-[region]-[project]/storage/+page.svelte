<script lang="ts" module>
    export let showCreateBucket = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import Create from './create.svelte';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { columns } from './store';
    import Grid from './grid.svelte';
    import Table from './table.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { resolveRoute } from '$lib/stores/navigation';
    import { isServiceLimited } from '$lib/stores/billing';
    import type { PageProps } from './$types';
    import { organization } from '$lib/stores/organization';

    let { data }: PageProps = $props();

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        showCreateBucket.set(false);
        await goto(
            resolveRoute('/(console)/project-[region]-[project]/storage/bucket-[bucket]', {
                ...page.params,
                bucket: event.detail.$id
            })
        );
    }

    const isLimited = $derived(isServiceLimited('buckets', $organization, data.buckets.total));
</script>

<Container>
    <ResponsiveContainerHeader
        {columns}
        hasSearch
        view={data.view}
        searchPlaceholder="Search by name or ID">
        {#if $canWriteBuckets}
            <Tooltip disabled={!isLimited} maxWidth="200px">
                <div>
                    <Button
                        size="s"
                        event="create_bucket"
                        disabled={isLimited}
                        on:click={() => ($showCreateBucket = true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Create bucket
                    </Button>
                </div>
                <svelte:fragment slot="tooltip">
                    You have reached the maximum number of buckets for your plan.
                </svelte:fragment>
            </Tooltip>
        {/if}
    </ResponsiveContainerHeader>

    {#if data.buckets.total}
        {#if data.view === 'grid'}
            <Grid {data} bind:showCreate={$showCreateBucket} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Buckets"
            limit={data.limit}
            offset={data.offset}
            total={data.buckets.total} />
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/storage"
            target="bucket"
            on:click={() => showCreateBucket.set(true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreateBucket} on:created={bucketCreated} />
