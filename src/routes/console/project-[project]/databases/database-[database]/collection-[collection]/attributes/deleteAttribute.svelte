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
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    export let selectedAttribute: Attributes;
    const databaseId = $page.params.database;
    let checked = false;
    async function handleDelete() {
        try {
            await sdk.forProject.databases.deleteAttribute(
                databaseId,
                $collection.$id,
                selectedAttribute.key
            );
            await invalidate(Dependencies.COLLECTION);
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
    }

    function isRelationship(attr: Attributes): attr is Models.AttributeRelationship {
        return attr.type === 'relationship';
    }

    $: isDeleteBtnDisabled =
        isRelationship(selectedAttribute) && selectedAttribute?.twoWay && !checked;
</script>

<Modal
    icon="exclamation"
    state="warning"
    headerDivider={false}
    bind:show={showDelete}
    onSubmit={handleDelete}>
    <svelte:fragment slot="header">Delete Attribute</svelte:fragment>
    <p class="text" data-private>
        Are you sure you want to delete <b>"{selectedAttribute?.key}" from "{$collection?.name}"</b
        >?
    </p>
    {#if isRelationship(selectedAttribute) && selectedAttribute?.twoWay}
        <div class="u-flex u-flex-vertical u-gap-24">
            <p class="text">
                Are you sure you want to delete <b
                    >"{selectedAttribute?.key}" from "{$collection?.name}"? This is a two way
                    relationship and the corresponding relationship will also be deleted.
                </b>
            </p>
            <p class="text"><b>This action is irreversible.</b></p>
            <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                Delete relationship between {selectedAttribute.key} to {selectedAttribute.twoWayKey}
            </InputChoice>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button disabled={isDeleteBtnDisabled} secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
