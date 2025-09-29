<script lang="ts">
    import { trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { subNavigation } from '$lib/stores/database';
    import type { AnalyticsResult, DependenciesResult, Entity } from '$database/(entity)';
    import { EntityContainer } from '$database/(entity)/index.js';
    import { invalidate } from '$app/navigation';

    let {
        entity,
        onChangeName
    }: {
        entity: Entity;
        onChangeName: (updatedName: string) => Promise<void>;
    } = $props();

    let entityName: string = $state(entity.name);

    async function cleanup(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        subNavigation.update(); // update the side entity table.

        // events and notif!
        trackEvent(analytics.submit.entity('UpdateName'));
        addNotification({ message: 'Name has been updated', type: 'success' });

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function updateName(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        try {
            await onChangeName(entityName);
            await cleanup(analytics, dependencies);
        } catch (error) {
            addNotification({ message: error.message, type: 'error' });
            trackError(error, analytics.submit.entity('UpdateName'));
        }
    }
</script>

<EntityContainer>
    {#snippet children(analytics, dependencies)}
        <Form onSubmit={() => updateName(analytics, dependencies)}>
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
                    <Button disabled={entityName === entity.name || !entityName} submit
                        >Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
    {/snippet}
</EntityContainer>
