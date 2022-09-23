<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { createEventDispatcher } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    const create = async () => {
        try {
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
    <Modal bind:show={showCreate} size="big">
        <svelte:fragment slot="header">Create Event</svelte:fragment>

        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
