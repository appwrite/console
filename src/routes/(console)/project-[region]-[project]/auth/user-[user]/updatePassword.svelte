<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';
    import { page } from '$app/state';

    let newPassword: string = null;

    async function updatePassword() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
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
        <svelte:fragment slot="title">Password</svelte:fragment>
        A password must contain at least 8 characters.
        <svelte:fragment slot="aside">
            <InputPassword
                id="newPassword"
                label="New password"
                placeholder="Enter new password"
                autocomplete={false}
                bind:value={newPassword} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!newPassword} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
