<script lang="ts">
    import { Link } from '$lib/elements';
    import { Modal, Code } from '$lib/components';
    import PaginationInline from '$lib/components/paginationInline.svelte';
    import { IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { variablesOperation, type VariablesOperationItem } from './variablesOperation';

    let isOpen = true;
    let showDetails = false;
    let offset = 0;

    $: if (!$variablesOperation.length) {
        offset = 0;
    }

    $: if (offset >= $variablesOperation.length) {
        offset = Math.max(0, $variablesOperation.length - 1);
    }

    $: currentItem = $variablesOperation[offset] ?? null;

    function graphSize(status: VariablesOperationItem['status']): number {
        switch (status) {
            case 'uploading':
            case 'deleting':
                return 60;
            case 'completed':
            case 'failed':
                return 100;
        }
    }

    function text({ status, count, mode }: VariablesOperationItem): string {
        const label = `${count} variable${count === 1 ? '' : 's'}`;

        switch (status) {
            case 'completed':
                return mode === 'delete' ? `${label} deleted` : `${label} uploaded`;
            case 'failed':
                return mode === 'delete' ? `Variable deletion failed` : `Variable import failed`;
            case 'deleting':
                return `Deleting ${label}...`;
            case 'uploading':
                return `Uploading ${label}...`;
        }
    }
</script>

{#if currentItem}
    <Layout.Stack direction="column" gap="l" alignItems="flex-end">
        <section class="upload-box">
            <header class="upload-box-header">
                <h4 class="upload-box-title">
                    <Typography.Text variant="m-500">
                        {currentItem.mode === 'delete'
                            ? 'Deleting variables'
                            : 'Importing variables'}
                    </Typography.Text>
                </h4>
                <button
                    class="upload-box-button"
                    class:is-open={isOpen}
                    aria-label="toggle variables import box"
                    onclick={() => (isOpen = !isOpen)}>
                    <span class="icon-cheveron-up" aria-hidden="true"></span>
                </button>
                <button
                    class="upload-box-button"
                    aria-label="close variables import box"
                    onclick={() => variablesOperation.clear(currentItem.id)}>
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            </header>

            <div class="upload-box-content-list">
                <div class="upload-box-content" class:is-open={isOpen}>
                    <ul class="upload-box-list">
                        <li class="upload-box-item">
                            <section class="progress-bar u-width-full-line">
                                <div
                                    class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                                    <Typography.Text>{text(currentItem)}</Typography.Text>
                                </div>
                                <div
                                    class="progress-bar-container"
                                    class:is-danger={currentItem.status === 'failed'}
                                    style="--graph-size:{graphSize(currentItem.status)}%">
                                </div>
                                {#if currentItem.status === 'failed'}
                                    <Layout.Stack
                                        direction="row"
                                        gap="xs"
                                        alignItems="center"
                                        inline>
                                        <Icon
                                            icon={IconExclamationCircle}
                                            color="--fgcolor-error"
                                            size="s" />
                                        <Typography.Text color="--fgcolor-error">
                                            There was an issue
                                            {currentItem.mode === 'delete'
                                                ? ' deleting'
                                                : ' importing'}
                                            variables.
                                            {#if currentItem.error}
                                                <Link
                                                    style="color: inherit"
                                                    onclick={() => (showDetails = true)}>
                                                    View details
                                                </Link>
                                            {/if}
                                        </Typography.Text>
                                    </Layout.Stack>
                                {/if}
                            </section>
                        </li>
                    </ul>
                    {#if $variablesOperation.length > 1}
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            class="upload-box-pagination">
                            <Typography.Caption variant="400">
                                {offset + 1} of {$variablesOperation.length}
                            </Typography.Caption>
                            <PaginationInline
                                total={$variablesOperation.length}
                                limit={1}
                                bind:offset
                                hidePages />
                        </Layout.Stack>
                    {/if}
                </div>
            </div>
        </section>
    </Layout.Stack>
{/if}

<Modal title="Import error" bind:show={showDetails} hideFooter>
    <Layout.Stack gap="m">
        <Code language="sh" code={currentItem?.error ?? ''} withCopy allowScroll />
    </Layout.Stack>
</Modal>

<style lang="scss">
    .upload-box {
        display: flex;
        max-height: 320px;
        flex-direction: column;
    }

    .upload-box-header {
        flex-shrink: 0;
    }

    .upload-box-title {
        font-size: 11px;
    }

    .upload-box-content-list {
        overflow-y: auto;
    }

    .upload-box-content {
        width: 324px;
    }

    .upload-box-pagination {
        padding-top: 0.75rem;
    }

    .upload-box-button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .progress-bar-container {
        height: 4px;

        &::before {
            height: 4px;
            background-color: var(--bgcolor-neutral-invert);
        }

        &.is-danger::before {
            height: 4px;
            background-color: var(--bgcolor-error);
        }
    }
</style>
