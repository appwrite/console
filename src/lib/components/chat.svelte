<script>
    import { Divider, Card, Typography, Layout, Button, Icon } from '@appwrite.io/pink-svelte';
    import { IconArrowUp, IconChevronLeft, IconPaperClip } from '@appwrite.io/pink-icons-svelte';

    export let showChat;
    export let width;
</script>

<section class="chat" style:width={showChat ? `${width}px` : 0} class:is-visible={showChat}>
    <Card.Base>
        <div class="chat-content">
            <Layout.Stack height="calc(100vh - 120px)" justifyContent="space-between">
                <Layout.Stack gap="s">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
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

                    <Divider />
                    <!-- CHAT CONTENT -->
                </Layout.Stack>
                <div class="input">
                    <textarea placeholder="Reply..."></textarea>
                    <div class="options">
                        <Layout.Stack direction="row" justifyContent="flex-end">
                            <Button.Button icon variant="secondary" size="s"
                                ><Icon
                                    icon={IconPaperClip}
                                    color="--fgcolor-neutral-tertiary" /></Button.Button>
                            <Button.Button icon variant="secondary" size="s"
                                ><Icon
                                    icon={IconArrowUp}
                                    color="--fgcolor-neutral-tertiary" /></Button.Button>
                        </Layout.Stack>
                    </div>
                </div>
            </Layout.Stack>
        </div>
    </Card.Base>
</section>
<div class="chat-placeholder" class:is-visible={showChat} style:width={showChat ? `${width}px` : 0}>
</div>

<style lang="scss">
    .chat {
        width: 0;
        position: fixed;
        top: 48px;
        overflow: hidden;
        //transition: width 0.1s ease-in-out;
    }

    .chat-placeholder {
        flex-shrink: 0;
    }

    .chat-content {
        opacity: 0;
    }

    .is-visible .chat-content {
        transition: opacity 0.3s ease-in-out 0.2s;
        opacity: 1;
    }

    .input {
        margin-inline: calc(-1 * var(--space-9));
        margin-block-end: calc(-1 * var(--space-9));
        border-top: 1px solid var(--border-neutral);
        border-radius: var(--border-radius-m);
        padding: var(--space-6);

        textarea {
            width: 100%;
            min-height: 100px;
            overflow: hidden;
            resize: none;
        }
    }
</style>
