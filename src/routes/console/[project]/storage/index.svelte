<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Tooltip, Copy, Bucket } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { bucketList } from './store';

    let showCreate = false;
    let search = '';
    let offset = 0;

    const limit = 5;
    const project = $page.params.project;
    const bucketCreated = async (event: CustomEvent<Models.Bucket>) => {
        showCreate = false;
        await goto(`${base}/console/${project}/storage/bucket/${event.detail.$id}`);
    };

    $: bucketList.load(search, limit, offset ?? 0);
    $: if (search) offset = 0;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Buckets</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Add Bucket</span>
        </Button>
    </div>

    {#if $bucketList?.total}
        <div class="grid-box common-section" style="--grid-gap:2rem; --grid-item-size:25rem;">
            {#each $bucketList.buckets as bucket}
                <Bucket href={`${base}/console/${project}/storage/bucket/${bucket.$id}`}>
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
                            <Tooltip
                                icon="lock-closed"
                                aria="encryption"
                                disabled={!bucket.encryption}>
                                <span
                                    >{bucket.encryption
                                        ? 'Encryption enabled'
                                        : 'Encryption disabled'}</span>
                            </Tooltip>
                        </li>
                        <li>
                            <Tooltip
                                icon="shield-check"
                                aria="antivirus"
                                disabled={!bucket.antivirus}>
                                <span
                                    >{bucket.antivirus
                                        ? 'Antivirus enabled'
                                        : 'Antivirus disabled'}</span>
                            </Tooltip>
                        </li>
                    </svelte:fragment>
                </Bucket>
            {/each}
        </div>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$bucketList.total}</p>
            <Pagination {limit} bind:offset sum={$bucketList.total} />
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
            <Pagination {limit} bind:offset sum={$bucketList?.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <i class="icon-plus" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Add Your First Bucket To Get Started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={bucketCreated} />
