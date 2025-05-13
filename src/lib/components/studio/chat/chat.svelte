<script lang="ts">
    import { Divider, Typography, Layout, Button, Icon, Spinner } from '@appwrite.io/pink-svelte';
    import {
        IconArrowUp,
        IconChevronDown,
        IconChevronLeft,
        IconPaperClip
    } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import Conversation from './conversation.svelte';
    import { conversation, showChat } from '$lib/stores/chat';
    import type { StreamParser } from './parser';
    import type { EventHandler } from 'svelte/elements';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';

    type Props = {
        width: number;
        hasSubNavigation: boolean;
        parser: StreamParser;
    };
    let { width, hasSubNavigation, parser }: Props = $props();

    let minimizeChat = $state($isSmallViewport ? true : false);
    let message = $state('');
    let sending = $state(false);

    const onkeydown: EventHandler<KeyboardEvent, HTMLTextAreaElement> = (event) => {
        if (event.key === 'Enter') {
            if (!event.metaKey && !event.ctrlKey) return;
            event.preventDefault();
            createMessage();
        }
    };
    const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
        event.preventDefault();
        createMessage();
    };

    async function createMessage() {
        try {
            sending = true;
            const response = await fetch(
                `${sdk.forProject.client.config.endpoint}/imagine/artifacts/${$conversation.data.artifactId}/conversations/${$conversation.data.$id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Appwrite-Project': page.params.project,
                        'X-Appwrite-Mode': 'admin'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        content: message,
                        type: 'text'
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`${response.status} Error: ${await response.text()}`);
            }

            parser.chunk(`\n\n${message}\n\n`);
            message = '';

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let chunk = await reader.read();
            while (!chunk.done) {
                parser.chunk(decoder.decode(chunk.value));
                chunk = await reader.read();
            }
        } catch (error) {
            if (error instanceof Error) {
                parser.chunk(error.message);
            }
            console.error(error);
        } finally {
            sending = false;
        }
    }
</script>

<section
    class="chat"
    style:visibility={$showChat ? 'visible' : 'hidden'}
    style:width={$isSmallViewport ? 'calc(100vw - 16px)' : $showChat ? `${width}px` : 0}
    class:minimize-chat={minimizeChat}
    class:is-visible={$showChat}
    class:sub-navigation={hasSubNavigation}>
    <div class="chat-content">
        {#if !minimizeChat}
            <header>
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text>Chat</Typography.Text>
                    <Button.Button
                        icon
                        variant="secondary"
                        size="s"
                        on:click={() => {
                            if ($isSmallViewport) {
                                minimizeChat = !minimizeChat;
                            } else {
                                showChat.set(false);
                            }
                        }}
                        ><Icon
                            icon={$isSmallViewport ? IconChevronDown : IconChevronLeft}
                            color="--fgcolor-neutral-tertiary" /></Button.Button>
                </Layout.Stack>
            </header>
            <div class="divider-wrapper">
                <Divider />
            </div>

            <Conversation {parser} />
        {/if}
        <form {onsubmit} class="input" class:minimize-chat={minimizeChat}>
            <Layout.Stack
                direction={minimizeChat ? 'row' : 'column'}
                alignItems={minimizeChat ? 'center' : 'flex-end'}>
                <textarea
                    {onkeydown}
                    disabled={sending}
                    bind:value={message}
                    name="conversation"
                    placeholder="Chat with Imagine..."
                    onfocus={() => {
                        minimizeChat = false;
                    }}></textarea>
                <div class="options">
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Button.Button type="button" icon variant="secondary" size="s">
                            <Icon icon={IconPaperClip} color="--fgcolor-neutral-tertiary" />
                        </Button.Button>
                        <Button.Button
                            icon
                            variant="secondary"
                            size="s"
                            type="submit"
                            disabled={sending}>
                            {#if sending}
                                <Spinner size="s" />
                            {:else}
                                <Icon icon={IconArrowUp} color="--fgcolor-neutral-tertiary" />
                            {/if}
                        </Button.Button>
                    </Layout.Stack>
                </div>
            </Layout.Stack>
        </form>
    </div>
</section>
<div
    class="chat-placeholder"
    class:is-visible={$showChat}
    style:width={$showChat ? `${width}px` : 0}>
</div>

<style lang="scss">
    .chat {
        width: 0;
        position: absolute;
        top: 0;
        height: calc(100vh - 56px);
        z-index: 2;

        @media (min-width: 768px) {
            top: 0;
            height: calc(100vh - 70px);
        }

        &.sub-navigation {
            @media (max-width: 1024px) {
                top: 40px;
                height: calc(100vh - 96px);
            }
        }
    }
    .chat.minimize-chat {
        top: auto;
        bottom: 0;
        height: auto;
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
        height: calc(100% - var(--space-4));
        width: calc(100% + var(--space-7));

        background-color: var(--bgcolor-neutral-primary);
        border: 0;

        padding-inline: var(--space-4);

        @media (min-width: 768px) {
            width: 100%;
            height: 100%;
            padding-inline: var(--space-4);
            background-color: transparent;
        }
    }

    header {
        display: grid;
        gap: 1rem;
        padding-block: var(--base-8);
    }

    .divider-wrapper {
        margin-inline-start: calc(-1 * var(--space-4));
        width: calc(100% + 2 * var(--space-4));

        @media (min-width: 768px) {
            margin-inline-start: calc(-1 * var(--space-7));
            width: calc(100% + 2 * var(--space-7));
        }
    }

    // fix alignment bug in Safari
    @supports (hanging-punctuation: first) and (font: -apple-system-body) and
        (-webkit-appearance: none) {
        .divider-wrapper {
            margin-block-start: -1.5px;
        }
    }

    .is-visible .chat-content {
        transition: opacity 0.3s ease-in-out 0.2s;
        opacity: 1;
    }

    .input {
        border: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-m);
        padding: var(--space-6);

        textarea {
            width: 100%;
            min-height: 100px;
            resize: none;
        }

        @media (min-width: 768px) {
            margin-block-end: var(--space-4);
            margin-inline-start: calc(-1 * var(--space-4));
            border-radius: var(--border-radius-xs);
            width: calc(100% + 2 * var(--space-4));
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
