<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../.../../store';

    export let show = false;

    let name: string;
    let hostname: string;

    async function create() {
        try {
            await sdkForConsole.projects.createPlatform(
                $project.$id,
                'web',
                name,
                undefined,
                undefined,
                hostname
            );
            name = hostname = null;
            project.load($project.$id);
            show = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Form on:submit={create}>
    <Modal bind:show>
        <svelte:fragment slot="header">Add Platform</svelte:fragment>
        <FormList>
            <InputText id="name" label="Name" bind:value={name} autofocus required />
            <InputText id="host" label="Hostname" bind:value={hostname} required />
        </FormList>
        <svelte:fragment slot="footer">
            <Button submit>Register</Button>
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
