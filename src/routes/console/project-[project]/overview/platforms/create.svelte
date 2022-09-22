<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText, Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../.../../store';

    export let show = false;

    let name: string;
    let hostname: string;

    const create = async () => {
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
    };
</script>

<Form on:submit={create}>
    <Modal bind:show>
        <svelte:fragment slot="header">Add Platform</svelte:fragment>
        <InputText id="name" label="Name" bind:value={name} required />
        <InputText id="host" label="Hostname" bind:value={hostname} required />
        <svelte:fragment slot="footer">
            <Button submit>Register</Button>
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
