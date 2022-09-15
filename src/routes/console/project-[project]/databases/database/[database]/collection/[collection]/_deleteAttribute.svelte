<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { collection } from './store';
    import type { Attributes } from './store';
    import { sdkForProject } from '$lib/stores/sdk';

    export let showDelete = false;
    export let selectedAttribute: Attributes;
    const databaseId = $page.params.database;

    const handleDelete = async () => {
        try {
            await sdkForProject.databases.deleteAttribute(
                databaseId,
                $collection.$id,
                selectedAttribute.key
            );
            collection.removeAttribute(selectedAttribute);
            showDelete = false;
            await goto(
                `${base}/console/project-${$page.params.project}/databases/database/${databaseId}/collection/${$page.params.collection}/attributes`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={handleDelete}>
    <Modal warning={true} bind:show={showDelete}>
        <svelte:fragment slot="header">Delete Attribute</svelte:fragment>

        <p>
            Are you sure you want to delete <b>'{selectedAttribute.key}' from {$collection.name}</b
            >?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
