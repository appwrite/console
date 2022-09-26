<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { createEventDispatcher } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Pill } from '$lib/elements';

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

    const services = ['buckets', 'database', 'functions', 'teams', 'users'];

    // const databases = ['collections', 'documents'];
</script>

<Form on:submit={create}>
    <Modal bind:show={showCreate} size="big">
        <svelte:fragment slot="header">Create Event</svelte:fragment>

        <div class="u-flex u-gap-8">
            {#each services as service}
                <Pill button on:click>{service}</Pill>
            {/each}
        </div>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
