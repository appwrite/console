<script lang="ts" context="module">
    export let showCreateBucket = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import {
        Empty,
        GridItem1,
        CardContainer,
        PaginationWithLimit,
        Id,
        SearchQuery
    } from '$lib/components';
    import { Pill } from '$lib/elements';
    import Create from './create.svelte';
    import { Container, ContainerHeader } from '$lib/layout';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import type { PageData } from './$types';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';

    export let data: PageData;

    const project = $page.params.project;

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        $showCreateBucket = false;
        await goto(`${base}/project-${project}/storage/bucket-${event.detail.$id}`);
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery search={data.search} placeholder="Search buckets" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            {#if $canWriteBuckets}
                <Button
                    on:mousedown={() => ($showCreateBucket = true)}
                    event="create_bucket"
                    size="s">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create bucket</span>
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

    {#if data.buckets.total}
        <CardContainer
            showEmpty={$canWriteBuckets}
            total={data.buckets.total}
            offset={data.offset}
            event="bucket"
            service="buckets"
            on:click={() => ($showCreateBucket = true)}>
            {#each data.buckets.buckets as bucket}
                <GridItem1 href={`${base}/project-${project}/storage/bucket-${bucket.$id}`}>
                    <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if !bucket.enabled}
                            <Pill>Disabled</Pill>
                        {/if}
                    </svelte:fragment>

                    <Id value={bucket.$id}>{bucket.$id}</Id>

                    <svelte:fragment slot="icons">
                        <li>
                            <Tooltip>
                                <span
                                    class:u-opacity-20={!bucket.encryption}
                                    class="icon-lock-closed"
                                    aria-hidden="true" />
                                <span slot="tooltip"
                                    >{bucket.encryption
                                        ? 'Encryption enabled'
                                        : 'Encryption disabled'}</span>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip>
                                <span
                                    class:u-opacity-20={!bucket.antivirus}
                                    class="icon-shield-check"
                                    aria-hidden="true" />
                                <span slot="tooltip"
                                    >{bucket.antivirus
                                        ? 'Antivirus enabled'
                                        : 'Antivirus disabled'}</span>
                            </Tooltip>
                        </li>
                    </svelte:fragment>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a bucket</p>
            </svelte:fragment>
        </CardContainer>

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
            on:click={() => ($showCreateBucket = true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreateBucket} on:created={bucketCreated} />
