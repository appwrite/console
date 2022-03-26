<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText, Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let show = false;

    const dispatch = createEventDispatcher();

    let name: string;

    const create = async () => {
        try {
            await sdkForConsole.teams.create('unique()', name);
            name = null;
            dispatch('created');
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
        <svelte:fragment slot="header">Create Project</svelte:fragment>
        <InputText id="name" label="Name" bind:value={name} required />
        <svelte:fragment slot="footer">
            <Button submit>Create</Button>
            <Button secondary on:click={() => (show = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
