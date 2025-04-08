<script lang="ts">
    import { Divider, Card, Typography, Layout, Button, Icon } from '@appwrite.io/pink-svelte';
    import {
        IconArrowUp,
        IconChevronDown,
        IconChevronLeft,
        IconPaperClip
    } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import Conversation from './conversation.svelte';

    type Props = {
        showChat: boolean;
        width: number;
    };
    let { showChat = $bindable(), width }: Props = $props();

    let minimizeChat = $state(false);
</script>

<section class="chat" style:width={showChat ? `${width}px` : 0} class:is-visible={showChat}>
    <div class="chat-content">
        <header>
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography.Text>Chat</Typography.Text>
                <Button.Button
                    icon
                    variant="secondary"
                    size="s"
                    on:click={() => {
                        showChat = false;
                    }}
                    ><Icon
                        icon={IconChevronLeft}
                        color="--fgcolor-neutral-tertiary" /></Button.Button>
            </Layout.Stack>
        </header>
        <Divider />

        <Conversation />
        <div class="input">
            <textarea placeholder="Reply..."></textarea>
            <Layout.Stack direction="row" justifyContent="flex-end">
                <Button.Button icon variant="secondary" size="s"
                    ><Icon
                        icon={IconPaperClip}
                        color="--fgcolor-neutral-tertiary" /></Button.Button>
                <Button.Button icon variant="secondary" size="s"
                    ><Icon icon={IconArrowUp} color="--fgcolor-neutral-tertiary" /></Button.Button>
            </Layout.Stack>
        </div>
    </div>
</section>
<div class="chat-placeholder" class:is-visible={showChat} style:width={showChat ? `${width}px` : 0}>
</div>
{#if $isSmallViewport}
    <button
        type="button"
        class="overlay-button"
        aria-label="Close chat"
        class:overlay={!minimizeChat}></button>
{/if}

<style lang="scss">
    .chat {
        width: 0;
        position: fixed;
        top: 48px;
        height: calc(100vh - 48px);
        //transition: width 0.1s ease-in-out;
    }

    .chat-placeholder {
        flex-shrink: 0;
    }

    .chat-content {
        opacity: 0;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: min-content min-content auto min-content;
        gap: 0;
        grid-template-areas:
            '.'
            '.'
            '.'
            '.';
        height: 100%;
        background-color: white;
        width: 100%;
        border: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-m);
    }

    header {
        display: grid;
        gap: 1rem;
        padding: 1rem;
    }

    .is-visible .chat-content {
        transition: opacity 0.3s ease-in-out 0.2s;
        opacity: 1;
    }

    .input {
        border-top: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-m);
        padding: var(--space-6);

        textarea {
            width: 100%;
            min-height: 100px;
            resize: none;
        }

        .options {
        }
    }

    .input.minimize-chat {
        border: 0;
        padding: var(--space-6);
        margin-inline: var(--space-4);

        textarea {
            min-height: 20px;
            height: 20px;
        }
    }

    .overlay {
        background-color: rgba(0, 0, 0, 0.4);
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: #56565c1a;
        backdrop-filter: blur(5px);
        transition:
            backdrop-filter 0.5s ease-in-out,
            background-color 0.35s ease-in-out;
        z-index: 1;
        margin-top: 0 !important;
    }

    .overlay-button {
        margin-top: calc(-1 * var(--space-6));
        @media (min-width: 768px) {
            display: none;
        }
    }
</style>
