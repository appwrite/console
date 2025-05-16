<script lang="ts">
    import { Divider, Typography, Layout, Button, Icon } from '@appwrite.io/pink-svelte';
    import {
        IconArrowUp,
        IconChevronDown,
        IconChevronLeft,
        IconPaperClip,
        IconStop
    } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import Conversation from './conversation.svelte';
    import { conversation, showChat } from '$lib/stores/chat';
    import type { StreamParser } from './parser';
    import type { EventHandler } from 'svelte/elements';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    type Props = {
        width: number;
        hasSubNavigation: boolean;
        parser: StreamParser;
    };
    let { width, hasSubNavigation, parser }: Props = $props();

    let minimizeChat = $state($isSmallViewport ? true : false);
    let message = $state('');
    let sending = $state(false);
    let firstByteReceived = $state(true);

    let chatTextareaRef: HTMLTextAreaElement | null = $state(null);

    const onkeydown: EventHandler<KeyboardEvent, HTMLTextAreaElement> = (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) return;
            event.preventDefault();
            createMessage();
        }
    };
    const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
        event.preventDefault();
        if (sending) controller.abort();
        else createMessage();
    };

    $effect(() => {
        void page.url.pathname;
        if (chatTextareaRef) {
            chatTextareaRef.focus();
        }
    });

    let controller: AbortController;

    async function createMessage() {
        const group = Symbol();
        if (message.startsWith('!')) {
            const [type, ...segments] = message.split(' ');
            const content = segments.join(' ');
            message = '';
            const value = `<action type="${type.replace('!', '')}">${content}</action>`;
            parser.chunk(value, 'system', {
                group
            });
            parser.end();

            return;
        }
        const initialMessage = message;
        try {
            parser.chunk(message, 'user');
            firstByteReceived = false;
            message = '';
            controller = new AbortController();
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
                        content: initialMessage,
                        type: 'text'
                    }),
                    signal: controller.signal
                }
            );

            if (!response.ok) {
                throw new Error(`${response.status} Error: ${await response.text()}`);
            }

            invalidate(Dependencies.ARTIFACTS);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let chunk = await reader.read();
            while (!chunk.done) {
                if (!firstByteReceived) firstByteReceived = true;
                parser.chunk(decoder.decode(chunk.value), 'system', {
                    group
                });
                chunk = await reader.read();
            }
            parser.end();
        } catch (error) {
            if (error instanceof Error) {
                parser.chunk(error.message, 'error');
            }
            message = initialMessage;
        } finally {
            firstByteReceived = true;
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

            <Conversation {parser} thinking={!firstByteReceived} />
        {/if}
        <form {onsubmit} class="input" class:minimize-chat={minimizeChat}>
            <Layout.Stack
                direction={minimizeChat ? 'row' : 'column'}
                alignItems={minimizeChat ? 'center' : 'flex-end'}>
                <textarea
                    {onkeydown}
                    bind:this={chatTextareaRef}
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
                        <Button.Button icon variant="secondary" size="s" type="submit">
                            {#if sending}
                                <Icon icon={IconStop} color="--fgcolor-neutral-tertiary" />
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
            margin-block-end: var(--space-2);
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
</style>
