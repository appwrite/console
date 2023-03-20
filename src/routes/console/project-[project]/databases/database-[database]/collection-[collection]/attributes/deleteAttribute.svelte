<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { collection } from '../store';
    import type { Attributes } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;
    export let selectedAttribute: Attributes;
    const databaseId = $page.params.database;
    let checked = selectedAttribute?.type !== 'relationship';

    const handleDelete = async () => {
        try {
            await sdk.forProject.databases.deleteAttribute(
                databaseId,
                $collection.$id,
                selectedAttribute.key
            );
            invalidate(Dependencies.COLLECTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Attribute has been deleted`
            });
            trackEvent(Submit.AttributeDelete);
            await goto(
                `${base}/console/project-${$page.params.project}/databases/database-${databaseId}/collection-${$page.params.collection}/attributes`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AttributeDelete);
        }
    };
</script>

<Modal icon="exclamation" state="warning" bind:show={showDelete} on:submit={handleDelete}>
    <svelte:fragment slot="header">Delete Attribute</svelte:fragment>
    <p class="text" data-private>
        Are you sure you want to delete <b>'{selectedAttribute?.key}' from {$collection?.name}</b>?
    </p>
    {#if selectedAttribute?.type === 'relationship'}
        <div class="u-flex u-flex-vertical u-gap-24">
            <p class="text">
                Are you sure you want to delete reviews from Movie? This is a two way relationship
                and the corresponding relationship will also be deleted.
            </p>
            <p class="text"><b>This action is irreversible.</b></p>
            <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                Delete relationship between {selectedAttribute.relation} to {selectedAttribute.related}
            </InputChoice>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button disabled={!checked} secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
