<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { database } from './store';
    import { FormList } from '$lib/elements/forms/index.js';

    const databaseId = $page.params.database;

    export let showDelete = false;
    let confirmedDeletion = false;

    const handleDelete = async () => {
        try {
            await sdk.forProject.databases.delete(databaseId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$database.name} has been deleted`
            });
            await goto(`${base}/project-${$page.params.project}/databases`);
            trackEvent(Submit.DatabaseDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseDelete);
        }
    };
</script>

<Modal
    title="Delete database"
    icon="exclamation"
    state="warning"
    size="small"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}>
    <FormList>
        <p class="text" data-private>
            Are you sure you want to delete <b>{$database.name}</b>?
        </p>

        <p class="text" data-private>
            <b>Once deleted, this database cannot be restored. This action is irreversible.</b>
        </p>

        <div class="input-check-box-friction">
            <InputCheckbox
                required
                size="small"
                id="delete_policy"
                bind:checked={confirmedDeletion}
                label="I understand and confirm" />
        </div>
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit disabled={!confirmedDeletion}>Delete</Button>
    </svelte:fragment>
</Modal>
