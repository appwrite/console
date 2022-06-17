<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Tiles, Tooltip } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from 'src/sdk';
    import Create from './_create.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { addNotification } from '$lib/stores/notifications';

    let showCreate = false;
    let search = '';
    let offset = 0;

    const limit = 5;
    const project = $page.params.project;
    const bucketCreated = async (event: CustomEvent<Models.Bucket>) => {
        showCreate = false;
        await goto(`${base}/console/${project}/storage/bucket/${event.detail.$id}`);
    };

    $: request = sdkForProject.storage.listBuckets(search, limit, offset);
    $: if (search) offset = 0;

    const copy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            addNotification({
                message: 'Copied to clipboard.',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Buckets</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Add Bucket</span>
        </Button>
    </div>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Tiles>
                {#each response.buckets as bucket}
                    <a
                        class="card"
                        href={`${base}/console/${project}/storage/bucket/${bucket.$id}`}>
                        <div class="u-flex u-main-space-between">
                            <span class="is-small">XX Files</span>
                            {#if !bucket.enabled}
                                <Pill>Disabled</Pill>
                            {/if}
                        </div>
                        <h3 class="tiles-title">{bucket.name}</h3>
                        <div class="u-flex u-main-space-between">
                            <Pill button on:click={() => copy(bucket.$id)}
                                ><i class="icon-duplicate" />Bucket ID
                            </Pill>
                            <div class="">
                                <Tooltip icon="lock-closed" aria="encryption">
                                    <span
                                        >{bucket.encryption
                                            ? 'Encryption enabled'
                                            : 'Encryption disabled'}</span>
                                </Tooltip>
                                <Tooltip icon="shield-check" aria="antivirus">
                                    <span
                                        >{bucket.antivirus
                                            ? 'Antivirus enabled'
                                            : 'Antivirus disabled'}</span>
                                </Tooltip>
                            </div>
                        </div>
                    </a>
                {/each}
            </Tiles>

            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {response.total}</p>
                <Pagination {limit} bind:offset sum={response.total} />
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
            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {response.total}</p>
                <Pagination {limit} bind:offset sum={response.total} />
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
    {/await}
</Container>

<Create bind:showCreate on:created={bucketCreated} />
