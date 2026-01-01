<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { Badge, Tooltip, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import Link from '$lib/elements/link.svelte';

    export let data: PageData;
    export let showCreate = false;

    const region = page.params.region;
    const project = page.params.project;

    let isMouseOverTooltip = false;
    function hidePopover(hideTooltip: () => void, timeout = true) {
        if (!timeout) {
            isMouseOverTooltip = false;
            return hideTooltip();
        }

        setTimeout(() => {
            if (!isMouseOverTooltip) {
                hideTooltip();
            }
        }, 150);
    }
</script>

<CardContainer
    disableEmpty={!$canWriteBuckets}
    total={data.buckets.total}
    offset={data.offset}
    event="bucket"
    service="buckets"
    on:click={() => (showCreate = true)}>
    {#each data.buckets.buckets as bucket}
        {@const showOptimizable = bucket.transformations}
        {@const bucketId = bucket.$id}
        <GridItem1 href={`${base}/project-${region}-${project}/storage/bucket-${bucketId}`}>
            <svelte:fragment slot="title">
                <Layout.Stack direction="row" gap="s" alignItems="center">
                    <span>{bucket.name}</span>
                    {#if showOptimizable}
                        <Popover let:show let:hide placement="bottom-start" portal>
                            <span
                                role="presentation"
                                on:mouseenter={() => {
                                    setTimeout(show, 150);
                                }}
                                on:mouseleave={() => hidePopover(hide)}>
                                <Badge size="s" variant="secondary" content="Optimizable" />
                            </span>
                            <div
                                slot="tooltip"
                                let:hide
                                let:showing
                                role="tooltip"
                                style="width: 20rem;"
                                on:mouseenter={() => (isMouseOverTooltip = true)}
                                on:mouseleave={() => hidePopover(hide, false)}>
                                {#if showing}
                                    <Typography.Text variant="m-500">
                                        This bucket contains large images. Use{' '}
                                        <Link
                                            href={`${base}/project-${region}-${project}/storage/bucket-${bucketId}/settings#transformations`}
                                            class="u-underline"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                hide();
                                                goto(
                                                    `${base}/project-${region}-${project}/storage/bucket-${bucketId}/settings#transformations`
                                                );
                                            }}>image transformations</Link
                                        >{' '}to serve optimized versions in your app.
                                    </Typography.Text>
                                {/if}
                            </div>
                        </Popover>
                    {/if}
                </Layout.Stack>
            </svelte:fragment>
            <svelte:fragment slot="status">
                {#if !bucket.enabled}
                    <Badge size="s" variant="secondary" content="Disabled" />
                {/if}
            </svelte:fragment>

            <Id value={bucket.$id}>{bucket.$id}</Id>

            <svelte:fragment slot="icons">
                <Tooltip>
                    <span
                        class:u-opacity-20={!bucket.encryption}
                        class="icon-lock-closed"
                        aria-hidden="true"></span>
                    <span slot="tooltip">
                        {bucket.encryption ? 'Encryption enabled' : 'Encryption disabled'}
                    </span>
                </Tooltip>
            </svelte:fragment>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p>Create a bucket</p>
    </svelte:fragment>
</CardContainer>
