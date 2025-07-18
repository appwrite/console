<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import type { ParsedItem } from './parser';
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
    import { queue } from './queue.svelte';
    import { studio } from '../studio.svelte';
    import MessageActions from './messageActions.svelte';

    type Props = {
        message: ParsedItem;
    };
    let { message }: Props = $props();
    const tickets = $state([message.group]);

    async function processQueueItem() {
        if (tickets.length === 0 || !message.group) return;

        const ticket = tickets.pop();
        if (!ticket) return;

        const list = queue.lists[message.group];
        if (!list || !list.some((item) => item.status === 'waiting')) {
            tickets.push(ticket);
            return;
        }

        const item = queue.dequeue(message.group);
        if (!item) {
            tickets.push(ticket);
            return;
        }

        try {
            const action = item.data;
            switch (action.type) {
                case 'file':
                    await studio.synapse.dispatch('fs', {
                        operation: 'updateFile',
                        params: {
                            filepath: action.src,
                            content: action.content
                        }
                    });
                    studio.filesystem.add(action.src);
                    break;
                case 'shell':
                    await studio.synapse.dispatch(
                        'terminal',
                        {
                            operation: 'createCommand',
                            params: {
                                command: action.content + '\n'
                            }
                        },
                        {
                            noReturn: action.content.endsWith('run dev'),
                            timeout: 30_000
                        }
                    );
                    break;
            }

            if (message.group) {
                const status = action.complete ? 'done' : 'waiting';
                queue.update(message.group, item.id, { status });
            }
        } catch (error) {
            console.error('Error processing queue item:', error);

            if (message.group) {
                queue.update(message.group, item.id, { status: 'failed' });
            }
        } finally {
            tickets.push(ticket);

            setTimeout(checkForMoreItems, 100);
        }
    }

    function checkForMoreItems() {
        if (!message.group) return;

        const list = queue.lists[message.group];
        if (tickets.length > 0 && list && list.some((item) => item.status === 'waiting')) {
            processQueueItem();
        }
    }

    $effect(() => {
        if (!('type' in message)) return;
        if (message.type !== 'actions') return;
        if (!message.group) return;

        const list = queue.lists[message.group];
        if (!list) return;

        if (tickets.length > 0 && list.some((item) => item.status === 'waiting')) {
            processQueueItem();
        }
    });

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
            <MessageActions {message} />
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

    :global(.title) {
        margin-top: -2px;
        margin-left: -1px;
        width: calc(100% + 2px) !important;
    }

    :global(pre) {
        margin: 0;
    }

    :global(pre code.hljs) {
        padding: 0;
    }
</style>
