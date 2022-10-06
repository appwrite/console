<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText, Button, Form, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../.../../store';
    import Scopes from './scopes.svelte';

    export let show = false;

    let name: string;
    let scopes: string[] = [];

    async function create() {
        try {
            await sdkForConsole.projects.createKey($project.$id, name, scopes);
            name = null;
            scopes = [];
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
    <Modal bind:show size="big">
        <svelte:fragment slot="header">Create API Key</svelte:fragment>
        <FormList>
            <InputText id="name" label="Name" bind:value={name} autofocus required />
            <Scopes bind:scopes />
        </FormList>
        <svelte:fragment slot="footer">
            <Button submit>Register</Button>
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
