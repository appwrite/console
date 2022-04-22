<script lang="ts">
    import { Modal, InfoSection } from '$lib/components';
    import { Button, InputNumber, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';

    const projectId = $project.$id;
    let userLimit: number = $project.authLimit;
    export let showUserLimitModal = false;
    export let authLimit;

    const update = async () => {
        try {
            const oauth = await sdkForConsole.projects.updateAuthLimit(projectId, userLimit);
            console.log(oauth);
            authLimit = userLimit;
            showUserLimitModal = false;
            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={update}>
    <Modal bind:show={showUserLimitModal}>
        <svelte:fragment slot="header">Max Allowed Users</svelte:fragment>
        <InputNumber id="userLimit" label="User Limit" autofocus={true} bind:value={userLimit} />
        <InfoSection>
            <p>
                This limit will prevent new users from signing up for your project, no matter what
                auth method has been used. You will still be able to create users and team
                memberships from your Appwrite console. For an unlimited amount of users, set the
                limit to 0. Max limit is 10,000.
            </p>
        </InfoSection>
        <svelte:fragment slot="footer">
            <Button submit>Update</Button>
            <Button secondary on:click={() => (showUserLimitModal = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
