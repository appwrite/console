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
    import { cardLimit } from '$lib/stores/layout';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';

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

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create bucket</span>
        </Button>
    </div>

    {#if data.buckets.total}
        <CardContainer
            total={data.buckets.total}
            offset={data.offset}
            on:click={() => (showCreate = true)}>
            {#each data.buckets.buckets as bucket}
                <GridItem1 href={`${base}/console/project-${project}/storage/bucket-${bucket.$id}`}>
                    <svelte:fragment slot="eyebrow">XX Files</svelte:fragment>
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
                                class:u-opacity-0-2={!bucket.encryption}
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
                                class:u-opacity-0-2={!bucket.antivirus}
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
            <Pagination limit={$cardLimit} bind:offset={data.offset} sum={data.buckets.total} />
        </div>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">Create your first bucket to get started</p>
                <p class="text u-line-height-1-5">Need a hand? Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-12">
                <Button external href="#/" text>Documentation</Button>
                <Button secondary>Create bucket</Button>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={bucketCreated} />
