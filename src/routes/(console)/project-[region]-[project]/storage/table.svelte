<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Table, Badge, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';
    import { goto } from '$app/navigation';
    import Link from '$lib/elements/link.svelte';
    import { calculateSize } from '$lib/helpers/sizeConvertion';

    export let data: PageData;

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

<Table.Root columns={$columns} let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.buckets.buckets as bucket (bucket.$id)}
        <Table.Row.Link
            {root}
            href={`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${bucket.$id}`}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Id value={bucket.$id}>
                                {bucket.$id}
                            </Id>
                        {/key}
                    {:else if column.id === 'name'}
                        {bucket.name}
                    {:else if column.id === 'storageUsage'}
                        <Layout.Stack direction="row" gap="s" alignItems="center">
                            <span>{calculateSize(0)}</span>
                            {#if bucket.transformations}
                                <Popover let:show let:hide placement="bottom-start" portal>
                                    <span
                                        role="presentation"
                                        on:mouseenter={() => {
                                            setTimeout(show, 150);
                                        }}
                                        on:mouseleave={() => hidePopover(hide)}
                                        on:click|stopPropagation>
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
                                                    href={`${base}/project-${region}-${project}/storage/bucket-${bucket.$id}/settings#transformations`}
                                                    class="u-underline"
                                                    on:click={(e) => {
                                                        e.preventDefault();
                                                        hide();
                                                        goto(
                                                            `${base}/project-${region}-${project}/storage/bucket-${bucket.$id}/settings#transformations`
                                                        );
                                                    }}>image transformations</Link
                                                >{' '}to serve optimized versions in your app.
                                            </Typography.Text>
                                        {/if}
                                    </div>
                                </Popover>
                            {/if}
                        </Layout.Stack>
                    {:else if column.type === 'datetime'}
                        <DualTimeView time={bucket[column.id]} showDatetime />
                    {:else}
                        {bucket[column.id]}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>
