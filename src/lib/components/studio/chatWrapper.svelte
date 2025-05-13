<script lang="ts">
    import Chat from '$lib/components/studio/chat/chat.svelte';
    import { page } from '$app/state';
    import { conversation, showChat } from '$lib/stores/chat.js';
    import {
        disableBodySelect,
        enabledBodySelect,
        getChatWidthFromPrefs,
        saveChatWidthToPrefs
    } from '$lib/helpers/studioLayout.js';
    import { createStreamParser } from '$lib/components/studio/chat/parser.js';
    import { sdk } from '$lib/stores/sdk.js';
    import { synapse } from '$lib/components/studio/synapse.svelte.js';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { filesystem } from '$lib/components/editor/filesystem';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';

    $effect(() => {
        if ($isSmallViewport || page.params.artifact) {
            showChat.set(true);
        }
        if (!page.params.artifact) {
            showChat.set(false);
        }
    });

    let resizer = $state(null);
    let resizerLeftPosition = $state(
        page.data?.subNavigation ? getChatWidthFromPrefs() + 24 : getChatWidthFromPrefs()
    );
    let resizerLeftOffset = $state(page.data?.subNavigation ? 52 : 9);
    let chatWidth = $derived(resizerLeftPosition - resizerLeftOffset);

    $effect(() => {
        chatWidth = resizerLeftPosition - resizerLeftOffset;
    });

    let isResizing = false;

    function startResize() {
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchmove', resize);
        window.addEventListener('touchend', stopResize);
        disableBodySelect();

        if ($previewFrameRef) {
            $previewFrameRef.style.pointerEvents = 'none';
        }
    }

    function resize(event: TouchEvent | MouseEvent) {
        if (!isResizing) return;
        if (resizer) {
            resizerLeftPosition =
                ('touches' in event ? event.touches[0].clientX : event.clientX) - 60;
            const maxSize = page.data?.subNavigation
                ? window.innerWidth - 660
                : window.innerWidth - 540;

            const minSize = 320;
            if (resizerLeftPosition > maxSize) {
                resizerLeftPosition = maxSize;
            } else if (resizerLeftPosition < minSize) {
                if (resizerLeftPosition < minSize - 100) {
                    showChat.set(false);
                }

                resizerLeftPosition = minSize;
            } else if (resizerLeftPosition > minSize && !$showChat) {
                showChat.set(true);
            }
        }
    }

    function stopResize() {
        if (!$showChat) {
            resizerLeftPosition = 500;
        }
        const saveWidth = page.data?.subNavigation ? resizerLeftPosition - 24 : resizerLeftPosition;
        saveChatWidthToPrefs(saveWidth);

        isResizing = false;
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        window.removeEventListener('touchmove', resize);
        window.removeEventListener('touchend', stopResize);
        enabledBodySelect();

        if ($previewFrameRef) {
            $previewFrameRef.style.pointerEvents = '';
        }
    }

    const parser = createStreamParser();

    async function getConversation(artifactId: string) {
        parser.reset();
        const { conversations } = await sdk.forProject.imagine.listConversations(artifactId);
        if (conversations.length === 0) {
            const convo = sdk.forProject.imagine.createConversation(
                artifactId,
                `Conversation ${new Date().getTime()}`
            );
            conversation.set(convo);
        } else {
            conversation.set(conversations[0]);
        }
    }

    $effect(() => {
        if (page.params.artifact && $conversation.data?.artifactId !== page.params.artifact) {
            getConversation(page.params.artifact);
        }
    });

    conversation.subscribe(async (convo) => {
        if (!convo.data) return;
        const { messages } = await sdk.forProject.imagine.listMessages(
            convo.data.artifactId,
            convo.data.$id
        );
        const text = messages.reduce((curr, next) => {
            return curr + next.content;
        }, '');
        parser.init(text);
    });

    parser.on('complete', async (action) => {
        switch (action.type) {
            case 'file':
                await synapse.dispatch('fs', {
                    operation: 'updateFile',
                    params: {
                        filepath: action.src,
                        content: action.content
                    }
                });
                $filesystem = [...$filesystem, action.src];
                break;
            case 'shell':
                synapse.dispatch('terminal', {
                    operation: 'createCommand',
                    params: {
                        command: action.content + '\n'
                    }
                });
                break;
        }
    });
</script>

<Chat {parser} width={chatWidth} hasSubNavigation={false} />

{#if !$isSmallViewport && ($showChat || isResizing)}
    <div
        role="presentation"
        class="resizer"
        style:left={`${resizerLeftPosition}px`}
        class:hidden={!$showChat}
        bind:this={resizer}
        onmousedown={startResize}
        ontouchmove={startResize}>
    </div>
{/if}

<style lang="scss">
    .resizer {
        width: 16px;
        cursor: col-resize;
        margin-inline: 10px;
        position: absolute;
        height: calc(100vh - 72px);
        margin-block-start: calc(-1 * var(--base-8));
        margin-inline-start: 0;

        &::after {
            content: '';
            cursor: col-resize;
            position: absolute;
            height: 100%;
            width: 1px;
            margin-left: -1px;
            left: 8px;
            background-color: var(--border-neutral);
            opacity: 1;
            transition: all 0.3s ease-in-out;
        }

        &:hover::after {
            width: 2px;
            background-color: var(--border-neutral-strong);
        }
    }
</style>
