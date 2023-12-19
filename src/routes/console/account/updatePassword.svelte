<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

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
        <Heading tag="h6" size="7">Password</Heading>
        <p class="text">
            Forgot your password? <a class="link" href={`${base}/recover`}>Recover your password</a>
        </p>

        <svelte:fragment slot="aside">
            <FormList>
                <InputPassword
                    id="oldPassword"
                    label="Old password"
                    placeholder="Enter password"
                    showPasswordButton={true}
                    bind:value={oldPassword} />
                <InputPassword
                    id="newPassword"
                    label="New password"
                    placeholder="Enter password"
                    showPasswordButton={true}
                    bind:value={newPassword} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!newPassword || !oldPassword} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
