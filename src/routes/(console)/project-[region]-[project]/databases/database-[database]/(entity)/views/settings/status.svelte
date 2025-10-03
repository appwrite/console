<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CardGrid } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { trackEvent, trackError } from '$lib/actions/analytics';
    import {
        type Entity,
        getTerminologies
    } from '$database/(entity)';

    let {
        entity,
        onChangeStatus
    }: {
        entity: Entity;
        onChangeStatus: (updatedStatus: boolean) => Promise<void>;
    } = $props();

    let enabled: boolean = $state(entity.enabled);

    const { analytics, dependencies } = getTerminologies();

    async function cleanup() {
        // events and notif!
        trackEvent(analytics.submit.entity('UpdateEnabled'));
        addNotification({ message: `${entity.name} has been updated`, type: 'success' });

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function updateStatus() {
        try {
            await onChangeStatus(enabled);
            await cleanup();
        } catch (error) {
            addNotification({ message: error.message, type: 'error' });
            trackError(error, analytics.submit.entity('UpdateEnabled'));
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">{entity.name}</svelte:fragment>
    <svelte:fragment slot="aside">
        <ul>
            <InputSwitch
                id="toggle"
                label={enabled ? 'Enabled' : 'Disabled'}
                bind:value={enabled} />
        </ul>
        <div>
            <p>Created: {toLocaleDateTime(entity.$createdAt)}</p>
            <p>Last updated: {toLocaleDateTime(entity.$updatedAt)}</p>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={enabled === entity.enabled} on:click={updateStatus}>Update</Button>
    </svelte:fragment>
</CardGrid>
