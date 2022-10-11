<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';

    import { sdkForProject } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name = '';

    const create = async () => {
        try {
            await sdkForProject.storage.createBucket('unique()', name);
            name = null;
            showCreate = false;
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
    <Modal bind:show={showCreate}>
        <svelte:fragment slot="header">Create Function</svelte:fragment>
        <InputText id="name" label="Name" bind:value={name} required />
        <svelte:fragment slot="footer">
            <Button submit>Create</Button>
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
