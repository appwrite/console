<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, Helper } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { DedicatedDatabase } from '$lib/sdk/dedicatedDatabases';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    let storageGb: number = $state(database.storage);

    const isValid = $derived(storageGb >= database.storage && storageGb !== database.storage);

    async function updateStorage() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.update(database.$id, { storage: storageGb });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Storage has been resized',
                type: 'success'
            });

            trackEvent(Submit.DatabaseResizeStorage);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseResizeStorage);
        }
    }
</script>

<Form onSubmit={updateStorage}>
    <CardGrid>
        <svelte:fragment slot="title">Storage</svelte:fragment>
        Resize the storage allocated to your database. Storage can only be increased, not
        decreased.
        <svelte:fragment slot="aside">
            <InputNumber
                id="storage"
                label="Storage (GB)"
                min={database.storage}
                max={database.maxStorageGb || 1000}
                bind:value={storageGb}
                required />
            {#if storageGb < database.storage}
                <Helper type="warning">Storage can only be increased, not decreased.</Helper>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!isValid} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
