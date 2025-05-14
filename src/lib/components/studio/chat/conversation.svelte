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
    import { IconArrowDown, IconCheck, IconClock, IconCog } from '@appwrite.io/pink-icons-svelte';
    import { slide } from 'svelte/transition';
    import type { UIEventHandler, WheelEventHandler } from 'svelte/elements';
    import { queue } from './queue.svelte';
    import Message from './message.svelte';

    type Props = {
        parser: StreamParser;
        autoscroll?: boolean;
        streaming?: boolean;
    };
    let { parser, autoscroll = $bindable(true), streaming = $bindable(false) }: Props = $props();

    const chunks = parser.parsed;

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
        {#each $chunks as message (message.id)}
            <Message {message} />
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
</style>
