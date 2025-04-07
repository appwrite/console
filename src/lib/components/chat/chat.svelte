<script lang="ts">
    import { Divider, Card, Typography, Layout, Button, Icon } from '@appwrite.io/pink-svelte';
    import { IconArrowUp, IconChevronLeft, IconPaperClip } from '@appwrite.io/pink-icons-svelte';
    import Conversation from './conversation.svelte';

    type Props = {
        showChat: boolean;
        width: number;
    };
    let { showChat = $bindable(), width }: Props = $props();
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
</style>
