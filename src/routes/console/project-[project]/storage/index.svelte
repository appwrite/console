<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Copy, Bucket, EmptyBucket } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { bucketList } from './store';
    import { tooltip } from '$lib/actions/tooltip';
    import { pageLimit } from '$lib/stores/layout';

    let showCreate = false;
    let search = '';
    let offset = 0;

    const project = $page.params.project;
    const bucketCreated = async (event: CustomEvent<Models.Bucket>) => {
        showCreate = false;
        await goto(`${base}/console/project-${project}/storage/bucket/${event.detail.$id}`);
    };

    $: bucketList.load(search, $pageLimit, offset ?? 0);
    $: if (search) offset = 0;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Buckets</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create bucket</span>
        </Button>
    </div>

    {#if $bucketList?.total}
        <ul
            class="grid-box common-section u-margin-block-start-32"
            style={`--grid-gap:2rem; --grid-item-size:${
                $bucketList.total > 3 ? '22rem' : '25rem'
            };`}>
            {#each $bucketList.buckets as bucket}
                <Bucket href={`${base}/console/project-${project}/storage/bucket/${bucket.$id}`}>
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
                </Bucket>
            {/each}
            {#if $bucketList.total % 2 !== 0}
                <EmptyBucket on:click={() => (showCreate = true)}>
                    <div class="common-section">
                        <Button secondary round>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Add a new bucket</p>
                    </div>
                </EmptyBucket>
            {/if}
        </ul>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$bucketList.total}</p>
            <Pagination limit={$pageLimit} bind:offset sum={$bucketList.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <div class="common-section">
                    <p>There are no buckets that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$bucketList?.total}</p>
            <Pagination limit={$pageLimit} bind:offset sum={$bucketList?.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="bucket">
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <Button secondary round on:click={() => (showCreate = true)}>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Add your first bucket to get started</p>
                    </div>
                    <div class="common-section">
                        <Button secondary href="#">Documentation</Button>
                    </div>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={bucketCreated} />
