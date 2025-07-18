<script lang="ts">
    import type { ActionsContainer } from './parser';
    import {
        Card,
        Layout,
        ShimmerText,
        Spinner,
        Typography,
        Icon,
        Button
    } from '@appwrite.io/pink-svelte';
    import { queue } from './queue.svelte';
    import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';
    import { fade } from 'svelte/transition';
    import { measure } from '$lib/helpers/measure.svelte';

    type Props = {
        message: ActionsContainer;
    };

    const { message }: Props = $props();

    const { dimensions } = measure();
    $inspect({ dimensions });

    const firstActions = $derived(message.actions.slice(0, 3));
    const remainingActions = $derived(message.actions.slice(0, -3));
</script>

<Card.Base variant="primary" padding="none" class="message-action">
    <Card.Base variant="secondary" padding="xs" class="title">
        <Layout.Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography.Text variant="m-500">Version 0</Typography.Text>
            {#if !message.complete}
                <Spinner />
            {/if}
        </Layout.Stack>
    </Card.Base>
    <div class="wrap" style:height={`${dimensions.height}px`}>
        <div bind:clientHeight={dimensions.height}>
            <Layout.Stack gap="m" class="actions" direction="column">
                <div class="grid-line"></div>
                {#each firstActions as action}
                    {@const actionInQueue = queue.lists[action.group]?.find(
                        (n) => n.data.id === action.id
                    )}
                    {#if actionInQueue}
                        <div in:fade={{ duration: 200 }}>
                            <Layout.Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between">
                                {#if action.type === 'file'}
                                    <Typography.Code size="s" class="file">
                                        <span class="icon">
                                            {#if actionInQueue.status === 'done'}
                                                <Icon
                                                    size="s"
                                                    --icon-size-s="12px"
                                                    icon={IconCheckCircle} />
                                            {:else}
                                                <Spinner size="s" --icon-size-s="12px" />
                                            {/if}
                                        </span>
                                        <span class="filename">
                                            {action.src}</span
                                        ></Typography.Code>
                                {:else if action.type === 'shell'}
                                    <Typography.Code class="file" size="s">
                                        <span class="icon">
                                            {#if actionInQueue.status === 'done'}
                                                <Icon
                                                    size="s"
                                                    --icon-size-s="12px"
                                                    icon={IconCheckCircle} />
                                            {:else}
                                                <Spinner size="s" --icon-size-s="12px" />
                                            {/if}
                                        </span>
                                        <span class="filename">{action.content}</span
                                        ></Typography.Code>
                                {/if}
                            </Layout.Stack>
                        </div>
                    {/if}
                {/each}
                {#if !message.complete}
                    <Typography.Code size="s">
                        <ShimmerText>thinking...</ShimmerText>
                    </Typography.Code>
                {/if}
            </Layout.Stack>
        </div>
    </div>
    {#if firstActions.length >= 3}
        <Button.Button variant="secondary" size="xs" class="show-more">Show more</Button.Button>
    {/if}
</Card.Base>

<style>
    :global(.message-action) {
        padding-bottom: var(--space-2);
        position: relative;
    }

    :global(.actions) {
        padding: var(--space-6);
        position: relative;
        margin-left: var(--space-6);

        :global(.file) {
            display: flex;
            align-items: center;
            gap: 4px;

            .filename {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            }
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

    .wrap {
        transition: all ease-out 175ms;
    }

    :global(.show-more) {
        position: absolute;
        bottom: -12px;
        background-color: black;
        left: 50%;
        transform: translateX(-50%);
        padding: var(--space-1) var(--space-2) !important;
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
