<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import { StreamParser } from './parser';
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
    import { IconArrowDown, IconCheck, IconClock } from '@appwrite.io/pink-icons-svelte';
    import { slide } from 'svelte/transition';
    import type { UIEventHandler, WheelEventHandler } from 'svelte/elements';

    type Props = {
        parser: StreamParser;
        autoscroll?: boolean;
        streaming?: boolean;
    };
    let { parser, autoscroll = $bindable(true), streaming = $bindable(false) }: Props = $props();

    const chunks = parser.parsed;
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

    function scrollToBottom(smooth: boolean = true) {
        document
            .getElementById('bottom')
            .scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
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
                {#snippet text()}
                    <Markdown md={item.content} {plugins} />
                {/snippet}
                {#if item.from === 'user'}
                    <div class="message">
                        {@render text()}
                    </div>
                {:else if item.from === 'error'}
                    <div class="message">
                        {@render text()}
                    </div>
                {:else}
                    {@render text()}
                {/if}
            {/if}
        {/each}
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

<style lang="scss">
    .overflow {
        overflow: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-neutral, #ededf0) transparent;
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
        background: var(--bgColor-neutral-default, #fafafb);
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
