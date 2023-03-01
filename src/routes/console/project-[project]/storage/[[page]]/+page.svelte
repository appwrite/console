<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Copy, GridItem1, CardContainer, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import Create from '../create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { tooltip } from '$lib/actions/tooltip';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { CARD_LIMIT } from '$lib/constants';

    export let data: PageData;
    let showCreate = false;

    const project = $page.params.project;

    async function bucketCreated(event: CustomEvent<Models.Bucket>) {
        showCreate = false;
        await goto(`${base}/console/project-${project}/storage/bucket-${event.detail.$id}`);
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Buckets</Heading>

        <Button on:click={() => (showCreate = true)} event="create_bucket">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create bucket</span>
        </Button>
    </div>

    {#if data.buckets.total}
        <CardContainer
            total={data.buckets.total}
            offset={data.offset}
            event="bucket"
            on:click={() => (showCreate = true)}>
            {#each data.buckets.buckets as bucket}
                <GridItem1 href={`${base}/console/project-${project}/storage/bucket-${bucket.$id}`}>
                    <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if !bucket.enabled}
                            <Pill>Disabled</Pill>
                        {/if}
                    </svelte:fragment>

                    <Copy value={bucket.$id}>
                        <Pill button><i class="icon-duplicate" />Bucket ID</Pill>
                    </Copy>

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
                <p>Add a new bucket</p>
            </svelte:fragment>
        </CardContainer>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.buckets.total}</p>
            <Pagination
                limit={CARD_LIMIT}
                path={`/console/project-${$page.params.project}/storage`}
                offset={data.offset}
                sum={data.buckets.total} />
        </div>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/storage"
            target="bucket"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={bucketCreated} />
