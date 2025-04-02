<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import { createStreamParser } from './parser';
    import { onMount } from 'svelte';
    import data from './text.txt?raw';
    import { Badge, Card, Icon, InlineCode, Input, Layout, Tag } from '@appwrite.io/pink-svelte';
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
    import { IconCheck, IconClock } from '@appwrite.io/pink-icons-svelte';
    import type { WheelEventHandler } from 'svelte/elements';
    import { fly, slide } from 'svelte/transition';

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

    const parser = createStreamParser();
    const chunks = parser.parsed;
    let autoscroll = true;

    function scrollToBottom() {
        document.getElementById('bottom').scrollIntoView({ behavior: 'instant' });
    }

    function processStringInChunks(
        input: string,
        chunkSize: number = 40,
        delayMs: number = 25
    ): void {
        let position = 0;
        const processNextChunk = () => {
            if (position < input.length) {
                const chunk = input.substring(position, position + chunkSize);
                parser.chunk(chunk);
                position += chunkSize;
                if (autoscroll) scrollToBottom();
                setTimeout(processNextChunk, delayMs);
            }
        };
        processNextChunk();
    }

    const onwheel: WheelEventHandler<HTMLDivElement> = (event) => {
        autoscroll = false;
    };

    onMount(() => {
        processStringInChunks(data);
    });
</script>

<Layout.Stack direction="row">
    <Card.Base padding="none">
        <Layout.Stack>
            <div class="overflow" {onwheel}>
                <div class="chat">
                    <Layout.Stack>
                        {#each $chunks as item (item.id)}
                            {#if 'type' in item}
                                {#key item.content}
                                    {#if item.type === 'file'}
                                        <Card.Base variant="secondary" padding="xs">
                                            <Layout.Stack
                                                direction="row"
                                                gap="xxs"
                                                alignItems="center">
                                                {#if item.complete}
                                                    <Icon icon={IconCheck} />
                                                {:else}
                                                    <Icon icon={IconClock} />
                                                {/if}
                                                <Badge content={item.src} variant="secondary" />
                                            </Layout.Stack>
                                        </Card.Base>
                                    {:else if item.type === 'shell'}
                                        <Card.Base variant="secondary" padding="xs">
                                            <Layout.Stack
                                                direction="row"
                                                gap="xxs"
                                                alignItems="center">
                                                {#if item.complete}
                                                    <Icon icon={IconCheck} />
                                                {:else}
                                                    <Icon icon={IconClock} />
                                                {/if}
                                                <code>{item.content}</code>
                                            </Layout.Stack>
                                        </Card.Base>
                                    {/if}
                                {/key}
                            {:else}
                                <Markdown md={item.content} {plugins} />
                            {/if}
                        {/each}
                        <div id="bottom"></div>
                    </Layout.Stack>
                </div>
                <div class="actions">
                    <Layout.Stack alignItems="center">
                        {#if !autoscroll}
                            <span transition:slide>
                                <Tag
                                    on:click={() => {
                                        autoscroll = true;
                                        scrollToBottom();
                                    }}>auto scroll</Tag>
                            </span>
                        {/if}
                    </Layout.Stack>
                </div>
            </div>
            <Input.Textarea />
        </Layout.Stack>
    </Card.Base>
    <Card.Base>Iframe</Card.Base>
</Layout.Stack>

<style>
    .overflow {
        overflow-y: auto;
        height: calc(100vh - 120px);
    }

    .chat {
        margin: 1rem;
    }

    .actions {
        position: sticky;
        bottom: 0;
    }

    :global(pre) {
        margin: 0;
    }

    :global(pre code.hljs) {
        padding: 0;
    }
</style>
