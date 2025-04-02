<script lang="ts">
    import { Layout, Card, Typography, Divider } from '@appwrite.io/pink-svelte';
</script>

<Layout.Stack direction="row">
    <section class="chat">
        <Card.Base>
            <Layout.Stack height="calc(100vh - 120px)">
                <Typography.Text>Chat</Typography.Text>
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
        </Card.Base>
    </section>
    <Card.Base>Iframe</Card.Base>
</Layout.Stack>

<style>
    .chat {
        width: 600px;
    }
</style>
