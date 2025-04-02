<script>
    import { Divider, Card, Typography, Layout, Button, Icon } from '@appwrite.io/pink-svelte';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';

    export let showChat;
</script>

<section class="chat" class:is-visible={showChat}>
    <Card.Base>
        <div class="chat-content">
            <Layout.Stack height="calc(100vh - 120px)">
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text>Chat</Typography.Text>
                    <button
                        on:click={() => {
                            showChat = false;
                        }}>
                        <Icon icon={IconChevronLeft} />
                    </button>
                </Layout.Stack>

                <Divider />
                <Typography.Text>
                    Phasellus a ultricies nulla. Proin tristique aliquam dui. Phasellus porta
                    sodales justo, et feugiat ligula pulvinar sed. Morbi et nulla hendrerit,
                    pellentesque est sodales, euismod magna. Suspendisse vel massa arcu. Nulla
                    ultrices sit amet metus ac euismod. Curabitur ultrices aliquet libero, a
                    pharetra orci tristique in. Etiam egestas fermentum justo ut semper. Sed
                    vulputate eros erat, ac sollicitudin nulla condimentum volutpat. Sed vulputate
                    est ante.
                </Typography.Text>
            </Layout.Stack>
        </div>
    </Card.Base>
</section>

<style lang="scss">
    .chat {
        width: 0;
        overflow: hidden;
        transition: width 0.3s ease-in-out;

        &.is-visible {
            width: 600px;
        }
    }

    .chat-content {
        opacity: 0;
    }

    .is-visible .chat-content {
        transition: opacity 0.3s ease-in-out 0.2s;
        opacity: 1;
    }
</style>
