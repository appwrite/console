<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';
    import { page } from '$app/stores';

    let newPassword: string = null;

    async function updatePassword() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updatePassword($user.$id, newPassword);
            newPassword = null;
            addNotification({
                message: 'Password has been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdatePassword);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdatePassword);
        }
    }
</script>

<Form onSubmit={updatePassword}>
    <CardGrid>
        <div>
            <Heading tag="h6" size="7">Password</Heading>
        </div>

        <p>Enter a new password. A password must contain at least 8 characters.</p>
        <svelte:fragment slot="aside">
            <ul>
                <InputPassword
                    id="newPassword"
                    label="New Password"
                    placeholder="Enter new password"
                    autocomplete={false}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={newPassword} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!newPassword} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
