<script lang="ts" context="module">
    export let showCreateBucket = writable(false);
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { Empty, GridItem1, CardContainer, PaginationWithLimit, Id } from '$lib/components';
    import { Pill } from '$lib/elements';
    import Create from './create.svelte';
    import { Container, ContainerHeader } from '$lib/layout';
    import { base } from '$app/paths';
    import { tooltip } from '$lib/actions/tooltip';
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import type { PageData } from './$types';
    import { canWriteBuckets } from '$lib/stores/roles';

    export let data: PageData;

    const project = $page.params.project;

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        $showCreateBucket = false;
        await goto(
            `${base}/project-${$page.params.region}-${project}/storage/bucket-${event.detail.$id}`
        );
    }
</script>

<Container>
    <ContainerHeader
        title="Buckets"
        total={data.buckets.total}
        buttonText={$canWriteBuckets ? 'Create bucket' : null}
        buttonEvent="create_bucket"
        buttonMethod={() => ($showCreateBucket = true)} />
    {#if data.buckets.total}
        <CardContainer
            showEmpty={$canWriteBuckets}
            total={data.buckets.total}
            offset={data.offset}
            event="bucket"
            service="buckets"
            on:click={() => ($showCreateBucket = true)}>
            {#each data.buckets.buckets as bucket}
                <GridItem1
                    href={`${base}/project-${$page.params.region}-${project}/storage/bucket-${bucket.$id}`}>
                    <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if !bucket.enabled}
                            <Pill>Disabled</Pill>
                        {/if}
                    </svelte:fragment>

                    <Id value={bucket.$id}>{bucket.$id}</Id>

                    <svelte:fragment slot="icons">
                        <li>
                            <span
                                class:u-opacity-20={!bucket.encryption}
                                class="icon-lock-closed"
                                aria-hidden="true"
                                use:tooltip={{
                                    content: bucket.encryption
                                        ? 'Encryption enabled'
                                        : 'Encryption disabled'
                                }} />
                        </li>
                        <li>
                            <span
                                class:u-opacity-20={!bucket.antivirus}
                                class="icon-shield-check"
                                aria-hidden="true"
                                use:tooltip={{
                                    content: bucket.antivirus
                                        ? 'Antivirus enabled'
                                        : 'Antivirus disabled'
                                }} />
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
