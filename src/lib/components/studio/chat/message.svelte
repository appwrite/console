<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import type { ParsedItem, Action } from './parser';
    import { Badge, Card, Icon, Layout, Tag } from '@appwrite.io/pink-svelte';
    import Markdown, { type Plugin } from 'svelte-exmarkdown';
    import Li from './(markdown)/Li.svelte';
    import H1 from './(markdown)/H1.svelte';
    import H2 from './(markdown)/H2.svelte';
    import A from './(markdown)/A.svelte';
    import Strong from './(markdown)/Strong.svelte';
    import Em from './(markdown)/Em.svelte';
    import Ul from './(markdown)/Ul.svelte';
    import Ol from './(markdown)/Ol.svelte';
    import rehypeHighlight from 'rehype-highlight';
    import { IconCheck, IconClock, IconCog } from '@appwrite.io/pink-icons-svelte';
    import { queue } from './queue.svelte';
    import { synapse } from '../synapse.svelte';
    import { filesystem } from '$lib/components/editor/filesystem';

    type Props = {
        message: ParsedItem;
    };
    let { message }: Props = $props();
    const tickets = $state([message.group]);

    // Process one item from the queue
    async function processQueueItem() {
        // Try to get a ticket - if none available, return immediately
        if (tickets.length === 0 || !message.group) return;

        // Atomically get the ticket (pop removes and returns the last item)
        const ticket = tickets.pop();
        if (!ticket) return;

        // Check if there are waiting items in this group
        const list = queue.lists[message.group];
        if (!list || !list.some((item) => item.status === 'waiting')) {
            // No items to process, return the ticket
            tickets.push(ticket);
            return;
        }

        // Get the next item to process
        const item = queue.dequeue(message.group);
        if (!item) {
            // No items to dequeue, return the ticket
            tickets.push(ticket);
            return;
        }

        try {
            const action = item.data;
            switch (action.type) {
                case 'file':
                    await synapse.dispatch('fs', {
                        operation: 'updateFile',
                        params: {
                            filepath: action.src,
                            content: action.content
                        }
                    });
                    $filesystem = [...$filesystem, action.src];
                    break;
                case 'shell':
                    await synapse.dispatch(
                        'terminal',
                        {
                            operation: 'createCommand',
                            params: {
                                command: action.content + '\n'
                            }
                        },
                        {
                            timeout: 30_000
                        }
                    );
                    break;
            }

            // Mark job as done
            if (message.group) {
                queue.update(message.group, item.id, 'done');
            }
        } catch (error) {
            console.error('Error processing queue item:', error);

            // Mark as done even on error
            if (message.group) {
                queue.update(message.group, item.id, 'done');
            }
        } finally {
            // Return the ticket to the pool
            tickets.push(ticket);

            // Check for more items with a small delay
            setTimeout(checkForMoreItems, 100);
        }
    }

    // Check for more items to process
    function checkForMoreItems() {
        if (!message.group) return;

        // Check if there's anything to process and tickets are available
        const list = queue.lists[message.group];
        if (tickets.length > 0 && list && list.some((item) => item.status === 'waiting')) {
            processQueueItem();
        }
    }

    // Reactive effect to watch for changes and trigger processing
    $effect(() => {
        if (!('type' in message)) return;
        if (message.type !== 'actions') return;
        if (!message.group) return;

        const list = queue.lists[message.group];
        if (!list) return;

        // Try to process whenever the queue changes if tickets are available
        if (tickets.length > 0 && list.some((item) => item.status === 'waiting')) {
            processQueueItem();
        }
    });

    // No need for cleanup since tickets are automatically returned in finally block

    const plugins: Plugin[] = [
        {
            rehypePlugin: rehypeHighlight,
            renderer: {
                h1: H1,
                h2: H2,
                a: A,
                strong: Strong,
                em: Em,
                ul: Ul,
                ol: Ol,
                li: Li
            }
        }
    ];
</script>

{#if 'type' in message}
    {#key message.content}
        {#if message.type === 'actions'}
            <Card.Base variant="secondary" padding="xs">
                {#each message.actions as action}
                    {@const actionInQueue = queue.lists[action.group].find(
                        (n) => n.data.id === action.id
                    )}
                    {#if actionInQueue}
                        <Layout.Stack direction="row" gap="xxs" alignItems="center">
                            {#if actionInQueue.status === 'waiting'}
                                <Icon icon={IconCog} />
                            {:else if actionInQueue.status === 'processing'}
                                <Icon icon={IconClock} />
                            {:else if actionInQueue.status === 'done'}
                                <Icon icon={IconCheck} />
                            {/if}
                            {#if action.type === 'file'}
                                <Badge content={action.src} variant="secondary" />
                            {:else if action.type === 'shell'}
                                <code>{action.content}</code>
                            {/if}
                        </Layout.Stack>
                    {/if}
                {/each}
            </Card.Base>
        {/if}
    {/key}
{:else}
    {#snippet text()}
        <Markdown md={message.content} {plugins} />
    {/snippet}
    {#if message.from === 'user'}
        <div class="message">
            {@render text()}
        </div>
    {:else if message.from === 'error'}
        <div class="message">
            {@render text()}
        </div>
    {:else}
        {@render text()}
    {/if}
{/if}

<style lang="scss">
    .message {
        width: 90%;
        float: right;
        display: inline-flex;
        padding: 0.5rem;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 0.25rem;
        flex-shrink: 0;
        margin-inline-start: auto;
        border-radius: 0.5rem 0px 0.5rem 0.5rem;
        background: var(--bgcolor-neutral-default);
        box-shadow:
            0px 1.022px 4.089px 0px rgba(55, 59, 77, 0.1),
            0px 1.022px 4.089px -1.022px rgba(55, 59, 77, 0.1);
    }

    :global(pre) {
        margin: 0;
    }

    :global(pre code.hljs) {
        padding: 0;
    }
</style>
