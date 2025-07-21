<script lang="ts">
    import 'highlight.js/styles/atom-one-light.css';
    import { Icon, Spinner, Layout, Tag } from '@appwrite.io/pink-svelte';
    import { IconArrowDown } from '@appwrite.io/pink-icons-svelte';
    import { slide } from 'svelte/transition';
    import type { UIEventHandler, WheelEventHandler } from 'svelte/elements';
    import Message from './message.svelte';
    import { studio } from '../studio.svelte';
    import { Chat } from '@ai-sdk/svelte';
    import type { ImagineUIMessage } from '$shared-types';

    type Props = {
        autoscroll?: boolean;
        chat: Chat<ImagineUIMessage>;
    };
    let { autoscroll = $bindable(true), chat }: Props = $props();

    function scrollToBottom(smooth: boolean = true) {
        document
            .getElementById('bottom')
            .scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }

    const onwheel: WheelEventHandler<HTMLDivElement> = () => {
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

    const messagesWithCheckpoints = $derived(() => {
        return chat.messages.filter((message) =>
            message.parts.some((part) => part.type === 'data-checkpoint')
        );
    });

    const getMessageVersion = (message: ImagineUIMessage) => {
        const index = messagesWithCheckpoints().findIndex((m) => m.id === message.id);
        return index === -1 ? null : index + 1;
    };

    const isLatestVersion = (message: ImagineUIMessage) => {
        const index = messagesWithCheckpoints().findIndex((m) => m.id === message.id);
        return index === messagesWithCheckpoints().length - 1;
    };
</script>

<div class="overflow" {onwheel} {onscroll}>
    <section>
        {#each chat.messages as message (message.id)}
            <Message
                {message}
                version={getMessageVersion(message)}
                isLatestVersion={isLatestVersion(message)} />
        {/each}

        {#if chat.status === 'submitted' || chat.status === 'streaming'}
            <Icon size="m" icon={Spinner} />
        {/if}

        {#if chat.status === 'error'}
            <span style:color="var(--fgcolor-error)">{chat.error?.message}</span>
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
