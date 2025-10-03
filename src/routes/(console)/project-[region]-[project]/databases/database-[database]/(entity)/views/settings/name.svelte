<script lang="ts">
    import { trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { subNavigation } from '$lib/stores/database';
    import {
        type Entity,
        getTerminologies
    } from '$database/(entity)';
    import { invalidate } from '$app/navigation';

    let {
        entity,
        onChangeName
    }: {
        entity: Entity;
        onChangeName: (updatedName: string) => Promise<void>;
    } = $props();

    let entityName: string = $state(entity.name);
    const { analytics, dependencies } = getTerminologies();

    async function cleanup() {
        subNavigation.update(); // update the side entity table.

        // events and notif!
        trackEvent(analytics.submit.entity('UpdateName'));
        addNotification({ message: 'Name has been updated', type: 'success' });

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function updateName() {
        try {
            await onChangeName(entityName);
            await cleanup();
        } catch (error) {
            addNotification({ message: error.message, type: 'error' });
            trackError(error, analytics.submit.entity('UpdateName'));
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputText
                required
                id="name"
                label="Name"
                placeholder="Enter name"
                autocomplete={false}
                bind:value={entityName} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={entityName === entity.name || !entityName} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
