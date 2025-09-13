<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { page } from '$app/state';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    let creating = false;

    $: cleanUrl = page.url.origin + page.url.pathname;

    async function onSubmit() {
        if (creating) return;
        creating = true;
        try {
            await sdk.forConsole.account.createVerification({ url: cleanUrl });
            addNotification({ message: 'Verification email has been sent', type: 'success' });
            show = false;
        } catch (error) {
            addNotification({ message: error.message, type: 'error' });
        } finally {
            creating = false;
        }
    }
</script>

<Modal bind:show title="Send verification email" {onSubmit}>
    <Card.Base variant="secondary" padding="s">
        <Layout.Stack gap="m">
            <Typography.Text variant="m-400" gap="m">
                To continue using Appwrite Cloud, please verify your email address. An email will be
                sent to <Typography.Text variant="m-600" style="display:inline"
                    >{$user?.email}</Typography.Text>
            </Typography.Text>
        </Layout.Stack>
    </Card.Base>

    <svelte:fragment slot="footer">
        <Button submit disabled={creating}>Send email</Button>
    </svelte:fragment>
</Modal>
