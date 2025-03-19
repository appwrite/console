<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Button, Form, FormList, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Link } from '@appwrite.io/pink-svelte';

    let newPassword: string = null;
    let oldPassword: string = null;

    async function updatePassword() {
        try {
            await sdk.forConsole.account.updatePassword(newPassword, oldPassword);
            newPassword = oldPassword = null;
            addNotification({
                message: 'Password has been updated',
                type: 'success'
            });
            trackEvent(Submit.AccountUpdatePassword);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.AccountUpdatePassword);
        }
    }
</script>

<Form onSubmit={updatePassword}>
    <CardGrid>
        <svelte:fragment slot="title">Password</svelte:fragment>
        Forgot your password? <Link.Anchor href={`${base}/recover`}
            >Recover your password</Link.Anchor>

        <svelte:fragment slot="aside">
            <InputPassword
                id="oldPassword"
                label="Old password"
                placeholder="Enter password"
                required
                bind:value={oldPassword} />
            <InputPassword
                id="newPassword"
                label="New password"
                placeholder="Enter password"
                required
                bind:value={newPassword} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!newPassword || !oldPassword} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
