<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/state';
    import { getTerminologies } from '$database/(entity)';
    import ColumnDisplayNameInput from '../(components)/inputs/displayName.svelte';

    const collectionId = page.params.collection;
    const { terminology } = getTerminologies();

    let columnDisplayNameInput: ColumnDisplayNameInput | null = $state(null);
</script>

<Form
    onSubmit={async () => {
        await columnDisplayNameInput?.updateDisplayNames();
    }}>
    <CardGrid>
        <svelte:fragment slot="title">Custom columns</svelte:fragment>
        Add up to 5 document fields to display as columns in the collection view.

        <svelte:fragment slot="aside">
            <ColumnDisplayNameInput
                {collectionId}
                databaseType={terminology.type}
                bind:this={columnDisplayNameInput}
                onSuccess={async () => {
                    await invalidate(Dependencies.TEAM);
                    addNotification({
                        message: 'Display names have been updated',
                        type: 'success'
                    });
                    trackEvent(Submit.CollectionUpdateDisplayNames);
                }}
                onFailure={(error) => {
                    addNotification({
                        message: error.message,
                        type: 'error'
                    });
                    trackError(error, Submit.CollectionUpdateDisplayNames);
                }} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={columnDisplayNameInput?.hasChanged()} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
