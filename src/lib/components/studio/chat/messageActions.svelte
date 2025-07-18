<script lang="ts">
    import type { ActionsContainer } from './parser';
    import { Card, Layout, ShimmerText, Spinner, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { queue } from './queue.svelte';
    import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';

    type Props = {
        message: ActionsContainer;
    };

    const { message }: Props = $props();
</script>

<Card.Base variant="primary" padding="none">
    <Card.Base variant="secondary" padding="xs" class="title">
        <Layout.Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography.Text variant="m-500">Version 0</Typography.Text>
            {#if !message.complete}
                <Spinner />
            {/if}
        </Layout.Stack>
    </Card.Base>
    <div class="actions">
        <div class="grid-line"></div>
        {#each message.actions as action}
            {@const actionInQueue = queue.lists[action.group]?.find((n) => n.data.id === action.id)}
            {#if actionInQueue}
                <Layout.Stack direction="row" alignItems="center" justifyContent="space-between">
                    {#if action.type === 'file'}
                        <Typography.Code size="s" class="file">
                            <span class="icon">
                                {#if actionInQueue.status === 'done'}
                                    <Icon size="s" --icon-size-s="12px" icon={IconCheckCircle} />
                                {:else}
                                    <Spinner size="s" --icon-size-s="12px" />
                                {/if}
                            </span>
                            {action.src}</Typography.Code>
                        <Typography.Code size="s">
                            {#if actionInQueue.status === 'waiting'}
                                Waiting
                            {:else if actionInQueue.status === 'processing'}
                                <ShimmerText>Generating</ShimmerText>
                            {:else if actionInQueue.status === 'done'}
                                Generated
                            {:else if actionInQueue.status === 'failed'}
                                <span style:color="var(--fgcolor-error)">Failed</span>
                            {/if}
                        </Typography.Code>
                    {:else if action.type === 'shell'}
                        <Typography.Code class="file" size="s">
                            <span class="icon">
                                {#if actionInQueue.status === 'done'}
                                    <Icon size="s" --icon-size-s="12px" icon={IconCheckCircle} />
                                {:else}
                                    <Spinner size="s" --icon-size-s="12px" />
                                {/if}
                            </span>
                            {action.content}</Typography.Code>
                        <Typography.Code size="s">
                            {#if actionInQueue.status === 'waiting'}
                                Waiting
                            {:else if actionInQueue.status === 'processing'}
                                <ShimmerText>Running</ShimmerText>
                            {:else if actionInQueue.status === 'done'}
                                Completed
                            {:else if actionInQueue.status === 'failed'}
                                <span style:color="var(--fgcolor-error)">Failed</span>
                            {/if}
                        </Typography.Code>
                    {/if}
                </Layout.Stack>
            {/if}
        {/each}
        {#if !message.complete}
            <Typography.Code size="s">
                <ShimmerText>thinking...</ShimmerText>
            </Typography.Code>
        {/if}
    </div>
</Card.Base>

<style>
    .actions {
        padding: var(--space-6);
        position: relative;
        margin-left: var(--space-6);

        :global(.file) {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .icon {
            display: flex;
            align-items: center;
            margin-left: -17.5px;
            margin-right: 4px;
            background-color: var(--bgcolor-neutral-primary);
            flex: 0 0;
            position: relative;
            z-index: 10;
        }
    }

    .grid-line {
        position: absolute;
        inset: 0;
        width: 1px;
        background: linear-gradient(
            to bottom,
            transparent 0%,
            var(--border-neutral) 25%,
            var(--border-neutral) 75%,
            transparent 100%
        );
    }
</style>
