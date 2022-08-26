<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import InputCustomId from '$lib/elements/forms/inputCustomId.svelte';
    import { addNotification } from '$lib/stores/notifications';

    import { sdkForProject, setDatabase } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let id = '';
    let name = '';

    const create = async () => {
        try {
            setDatabase(id);
            const database = await sdkForProject.databases.create(name);
            name = id = null;
            showCreate = false;
            dispatch('created', database);
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
        <InputCustomId id="id" label="ID" bind:value={id} required />
        <InputText id="name" label="Name" bind:value={name} required />
        <svelte:fragment slot="footer">
            <Button submit>Create</Button>
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        </svelte:fragment>
    </Modal>
</Form>
