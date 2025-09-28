<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import {
        EntityContainer,
        type Entity,
        type AnalyticsResult,
        type DependenciesResult
    } from '$database/(entity)';

    let {
        entity,
        onChangeSecurity
    }: {
        entity: Entity;
        onChangeSecurity: (updatedSecurity: boolean) => Promise<void>;
    } = $props();

    // TODO: note that this can be documentSecurity as well!
    let entitySecurity: boolean = $state(entity.rowSecurity);

    const hasChanges = $derived(entitySecurity !== entity.rowSecurity);

    async function cleanup(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        // events and notif!
        trackEvent(analytics.submit.entity('UpdateSecurity'));
        addNotification({ message: `${entity.name} has been updated`, type: 'success' });

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function updateSecurity(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        try {
            await onChangeSecurity(entitySecurity);
            await cleanup(analytics, dependencies);
        } catch (error) {
            addNotification({ message: error.message, type: 'error' });
            trackError(error, analytics.submit.entity('UpdateSecurity'));
        }
    }
</script>

<EntityContainer>
    {#snippet children(analytics, dependencies, terminology)}
        {@const title = terminology.record.title.singular}
        {@const recordLower = terminology.record.lower.singular}
        {@const recordsLower = terminology.record.lower.plural}
        {@const entityLower = terminology.entity.lower.singular}

        <CardGrid>
            <svelte:fragment slot="title">{title} security</svelte:fragment>
            <svelte:fragment slot="aside">
                <InputSwitch bind:value={entitySecurity} id="security" label="{title} security" />

                <p class="text">
                    When {recordLower} security is enabled, users will be able to access {recordsLower}
                    for which they have been granted
                    <b>either {recordLower} or {entityLower} permissions</b>.
                </p>
                <p class="text">
                    If {recordLower} security is disabled, users can access rows
                    <b>only if they have {entityLower} permissions</b>. Row permissions will be
                    ignored.
                </p>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button
                    disabled={!hasChanges}
                    on:click={async () => {
                        await updateSecurity(analytics, dependencies);
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
    {/snippet}
</EntityContainer>
