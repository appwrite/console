<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import { StreamParser } from './parser';
    import { Icon, Layout, ShimmerText, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { IconArrowDown } from '@appwrite.io/pink-icons-svelte';
    import { slide } from 'svelte/transition';
    import type { UIEventHandler, WheelEventHandler } from 'svelte/elements';
    import Message from './message.svelte';
    import { studio } from '../studio.svelte';

    type Props = {
        parser: StreamParser;
        autoscroll?: boolean;
        thinking?: boolean;
    };
    let { parser, autoscroll = $bindable(true), thinking = false }: Props = $props();

    const chunks = parser.parsed;

    function scrollToBottom(smooth: boolean = true) {
        document
            .getElementById('bottom')
            .scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }

    const onwheel: WheelEventHandler<HTMLDivElement> = (event) => {
        if (studio.streaming) autoscroll = false;
    };

    const onscroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (studio.streaming && autoscroll) return;

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
        {#if thinking}
            <Typography.Code size="s">
                <ShimmerText>thinking...</ShimmerText>
            </Typography.Code>
        {/if}
        <div id="bottom"></div>
    </section>

    <div class="actions">
        <Layout.Stack alignItems="center">
            {#if !autoscroll}
                <span transition:slide style="--badge-padding-inline: var(--space-3);">
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
