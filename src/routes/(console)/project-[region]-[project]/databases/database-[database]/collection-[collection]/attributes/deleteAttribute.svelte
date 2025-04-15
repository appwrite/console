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
    import { isRelationship } from '../document-[document]/attributes/store';

    export let showDelete = false;
    export let selectedAttribute: Attributes;
    const databaseId = $page.params.database;
    let checked = false;
    async function handleDelete() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.deleteAttribute(databaseId, $collection.$id, selectedAttribute.key);
            await invalidate(Dependencies.COLLECTION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Attribute has been deleted`
            });
            trackEvent(Submit.AttributeDelete);
            await goto(
                `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${databaseId}/collection-${$page.params.collection}/attributes`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AttributeDelete);
        }
    }

    $: isDeleteBtnDisabled =
        isRelationship(selectedAttribute) && selectedAttribute?.twoWay && !checked;
</script>

<Modal
    title="Delete attribute"
    icon="exclamation"
    state="warning"
    headerDivider={false}
    bind:show={showDelete}
    onSubmit={handleDelete}>
    <p class="text" data-private>
        Are you sure you want to delete <b data-private>{selectedAttribute?.key}</b> from
        <b data-private>{$collection?.name}</b>?
    </p>
    {#if isRelationship(selectedAttribute) && selectedAttribute?.twoWay}
        <div class="u-flex u-flex-vertical u-gap-24">
            <p class="text">
                This is a two way relationship and the corresponding relationship will also be
                deleted.
            </p>
            <p class="text"><b>This action is irreversible.</b></p>
            <ul>
                <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                    Delete relationship between <b data-private>{selectedAttribute.key}</b> to
                    <b data-private>{selectedAttribute.twoWayKey}</b>
                </InputChoice>
            </ul>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button disabled={isDeleteBtnDisabled} secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
