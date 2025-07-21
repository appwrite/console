<script lang="ts">
    import { Chat } from '@ai-sdk/svelte';
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
    import type { EventHandler } from 'svelte/elements';
    import { page } from '$app/state';
    import { studio } from '../studio.svelte';
    import UpgradePrompt from '$routes/(console)/project-[region]-[project]/studio/artifact-[artifact]/upgradePrompt.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { conversation, showChat, workspaceState } from '$lib/stores/chat';
    import { DefaultChatTransport } from 'ai';
    import type { ImagineUIDataParts, ImagineUIMessage } from '$shared-types';
    import { VARS } from '../../../system';
    import { SvelteURL } from 'svelte/reactivity';

    type Props = {
        width: number;
        hasSubNavigation: boolean;
    };
    let { width, hasSubNavigation }: Props = $props();

    let minimizeChat = $state($isSmallViewport ? true : false);
    let message = $state('');

    let chatTextareaRef: HTMLTextAreaElement | null = $state(null);


    const chat = new Chat<ImagineUIMessage>({
        maxSteps: 20,
        id: $conversation.data.id,
        transport: new DefaultChatTransport({
            api: `${VARS.AI_SERVICE_BASE_URL}/api/chat`,
        }),
        messages: $conversation.data.messages ?? [],
        onData: (dataPart) => {
            console.log("data", dataPart);
            
            if (dataPart.type === "data-workspace-state") {
                const data = dataPart.data as ImagineUIDataParts["workspace-state"];
                const { state, workspaceUrl, steps } = data;
                workspaceState.set({
                    state,
                    workspaceUrl: workspaceUrl ? new SvelteURL(workspaceUrl) : null,
                    steps,
                });
            }
        },
        onFinish: (event) => {
        }
    });

    const onkeydown: EventHandler<KeyboardEvent, HTMLTextAreaElement> = (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) return;
            event.preventDefault();
            createMessage();
        }
    };
    const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
        event.preventDefault();
        tokens = tokens - 1;
        // if (studio.streaming) controller.abort();
        // else createMessage();
        createMessage();
    };

    $effect(() => {
        void page.url.pathname;
        if (chatTextareaRef && !$isSmallViewport) {
            chatTextareaRef.focus();
        }
    });

    async function refreshToken() {
        const token = await sdk
            .forProject(page.params.region, page.params.project)
            .account.createJWT();
        return token;
    }

    async function createMessage() {
        const token = await refreshToken();

        chat.sendMessage({
            role: "user",
            text: message,
        }, {
            body: {
                id: $conversation.data.id,
                projectId: page.params.project,
                artifactId: page.params.artifact,
            },
            headers: {
                "X-Imagine-Token": token.jwt
            }
        });

        message = '';
    }

    let tokens = $state(2);

    let isBlocked = $derived(tokens === 0);
</script>

<section
    class="chat"
    style:visibility={$showChat ? 'visible' : 'hidden'}
    style:width={$isSmallViewport ? 'calc(100dvw - 16px)' : $showChat ? `${width}px` : 0}
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

            <Conversation {chat} />

            {#if tokens < 2}
                <UpgradePrompt>
                    {#if !isBlocked}
                        <Typography.Text>
                            <a href="#upgrade" class="callout">Upgrade</a>
                            to increase your message limits.</Typography.Text>
                    {:else}
                        <Typography.Text>
                            You're out of free messages.
                            <a href="#upgrade" class="callout">Upgrade now.</a>
                        </Typography.Text>
                    {/if}
                </UpgradePrompt>
            {/if}
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
                    disabled={isBlocked}
                    onfocus={() => {
                        minimizeChat = false;
                    }}></textarea>
                <div class="options">
                    <Layout.Stack direction="row" justifyContent="flex-end" gap="xs">
                        <Button.Button type="button" icon variant="text" size="s">
                            <Icon icon={IconPaperClip} color="--fgcolor-neutral-tertiary" />
                        </Button.Button>
                        <Button.Button
                            icon
                            variant="secondary"
                            size="s"
                            type="submit"
                            disabled={!studio.streaming && !message.trim()}>
                            {#if studio.streaming}
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
        height: calc(100dvh - 56px);
        z-index: 2;

        @media (min-width: 768px) {
            top: 0;
            height: calc(100dvh - 70px);
        }

        &.sub-navigation {
            @media (max-width: 1024px) {
                top: 40px;
                height: calc(100dvh - 96px);
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
        background-color: var(--bgcolor-neutral-primary);
        position: relative;
        z-index: 10;

        textarea {
            width: 100%;
            min-height: 100px;
            resize: none;
            position: relative;
            z-index: 10;
        }

        @media (min-width: 768px) {
            margin-block-end: var(--space-2);
            margin-inline-start: calc(-1 * var(--space-4));
            border-radius: var(--border-radius-xs);
            width: calc(100% + 2 * var(--space-4));
        }
    }

    .callout {
        text-decoration: underline;
        text-underline-offset: 2px;
        color: var(--fgcolor-accent-neutral);
        text-decoration-color: rgba(255, 255, 255, 0.4);
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
