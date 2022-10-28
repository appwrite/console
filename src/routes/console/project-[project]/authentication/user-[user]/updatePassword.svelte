<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';

    let newPassword: string = null;

    async function updatePassword() {
        try {
            await sdkForProject.users.updatePassword($user.$id, newPassword);
            newPassword = null;
            addNotification({
                message: 'Password has been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<Form on:submit={updatePassword}>
    <CardGrid>
        <div>
            <Heading tag="h6" size="7">Update Password</Heading>
        </div>

        <p>
            Enter a new password. A password must contain <b>at least 8 characters.</b>
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputPassword
                    id="newPassword"
                    label="New Password"
                    placeholder="Enter new password"
                    autocomplete={false}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={newPassword} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!newPassword} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
