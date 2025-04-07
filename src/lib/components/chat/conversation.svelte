<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import { createStreamParser } from './parser';
    import data from './text.txt?raw';
    import {
        Badge,
        Button,
        Card,
        Fieldset,
        Icon,
        Layout,
        Tag,
        Input
    } from '@appwrite.io/pink-svelte';
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
    import { IconArrowDown, IconCheck, IconClock } from '@appwrite.io/pink-icons-svelte';
    import type { UIEventHandler, WheelEventHandler } from 'svelte/elements';
    import { slide } from 'svelte/transition';

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
    let streaming = false;

    let chunkSize = 40;
    let delayMs = 25;
    function scrollToBottom(smooth: boolean = true) {
        document
            .getElementById('bottom')
            .scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }

    function exampleStream(): void {
        let position = 0;
        const processNextChunk = () => {
            if (position < data.length) {
                streaming = true;
                const chunk = data.substring(position, position + chunkSize);
                parser.chunk(chunk);
                position += chunkSize;
                if (autoscroll) scrollToBottom();
                setTimeout(processNextChunk, delayMs);
            } else {
                streaming = false;
            }
        };
        processNextChunk();
    }

    const onwheel: WheelEventHandler<HTMLDivElement> = (event) => {
        if (streaming) autoscroll = false;
    };

    const onscroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (streaming && autoscroll) return;

        // check if user is at the bottom of the chat
        const { currentTarget } = event;
        if (
            currentTarget.scrollHeight - currentTarget.scrollTop - 100 <=
            currentTarget.clientHeight
        ) {
            autoscroll = true;
        } else {
            autoscroll = false;
        }
    };
</script>

<div class="overflow" {onwheel} {onscroll}>
    <section>
        {#each $chunks as item (item.id)}
            {#if 'type' in item}
                {#key item.content}
                    {#if item.type === 'file'}
                        <Card.Base variant="secondary" padding="xs">
                            <Layout.Stack direction="row" gap="xxs" alignItems="center">
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
                            <Layout.Stack direction="row" gap="xxs" alignItems="center">
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
        {#if !streaming}
            <Layout.Stack>
                <Fieldset legend="Demo">
                    <Layout.Stack>
                        <Input.Number required label="chunk size" bind:value={chunkSize} />
                        <Input.Number required label="delay (ms)" bind:value={delayMs} />
                        <Button.Button on:click={() => exampleStream()}>demo stream</Button.Button>
                        <Button.Button variant="secondary" on:click={() => parser.reset()}
                            >reset</Button.Button>
                    </Layout.Stack>
                </Fieldset>
            </Layout.Stack>
        {/if}
        <div id="bottom"></div>
    </section>

    <div class="actions">
        <Layout.Stack alignItems="center">
            {#if !autoscroll}
                <span transition:slide>
                    <Tag
                        on:click={() => {
                            autoscroll = true;
                            scrollToBottom(false);
                        }}><Icon size="s" icon={IconArrowDown} /></Tag>
                </span>
            {/if}
        </Layout.Stack>
    </div>
</div>

<style>
    .overflow {
        overflow: scroll;
    }
    section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    .actions {
        position: sticky;
        bottom: 1rem;
    }

    :global(pre) {
        margin: 0;
    }

    :global(pre code.hljs) {
        padding: 0;
    }
</style>
