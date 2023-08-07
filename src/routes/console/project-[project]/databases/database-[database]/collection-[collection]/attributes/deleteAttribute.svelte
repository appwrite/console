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
    import LL from '$i18n/i18n-svelte';

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
                message: $LL.components.notification.attributeDeleted()
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

    $: isDeleteBtnDisabled =
        isRelationship(selectedAttribute) && selectedAttribute?.twoWay && !checked;
</script>

<Modal
    icon="exclamation"
    state="warning"
    headerDivider={false}
    bind:show={showDelete}
    onSubmit={handleDelete}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteAttribute()}</svelte:fragment>
    <p class="text" data-private>
        {$LL.console.project.texts.databases.delete()}{' '}<b data-private
            >{selectedAttribute?.key}</b
        >{' '}{$LL.console.project.texts.databases.from()}{' '}<b data-private
            >{$collection?.name}</b
        >?
    </p>
    {#if isRelationship(selectedAttribute) && selectedAttribute?.twoWay}
        <div class="u-flex u-flex-vertical u-gap-24">
            <p class="text">
                {$LL.console.project.texts.databases.twoWayRelationship()}
            </p>
            <p class="text"><b>{$LL.console.project.texts.databases.irreversibleAction()}</b></p>
            <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                {$LL.console.project.texts.databases.deleteRelation()}{' '}<b data-private
                    >{selectedAttribute.key}</b
                >{' '}{$LL.console.project.texts.databases.to()}{' '}
                <b data-private>{selectedAttribute.twoWayKey}</b>
            </InputChoice>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button disabled={isDeleteBtnDisabled} secondary submit
            >{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
