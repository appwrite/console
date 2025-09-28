<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Button } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { Link } from '@appwrite.io/pink-svelte';
    import {
        type AnalyticsResult,
        type DependenciesResult,
        type Entity,
        EntityContainer
    } from '$database/(entity)';

    let {
        entity,
        onChangePermissions
    }: {
        entity: Entity;
        onChangePermissions: (permissions: string[]) => Promise<void>;
    } = $props();

    let entityPermissions: string[] = $state(entity.$permissions);

    async function cleanup(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        // events and notif!
        trackEvent(analytics.submit.entity('UpdatePermissions'));
        addNotification({ message: `${entity.name} has been updated`, type: 'success' });

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function updatePermissions(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        try {
            await onChangePermissions(entityPermissions);
            await cleanup(analytics, dependencies);
        } catch (error) {
            addNotification({ message: error.message, type: 'error' });
            trackError(error, analytics.submit.entity('UpdatePermissions'));
        }
    }

    const arePermsDisabled = $derived(
        !(entityPermissions && symmetricDifference(entityPermissions, entity.$permissions).length)
    );
</script>

<EntityContainer>
    {#snippet children(analytics, dependencies, { entity, record })}
        {@const type = entity.lower.plural}
        {@const records = record.lower.plural}
        <CardGrid>
            <svelte:fragment slot="title">Permissions</svelte:fragment>
            Choose who can access your {type} and {records}. <Link.Anchor
                href="https://appwrite.io/docs/products/databases/permissions"
                target="_blank"
                rel="noopener noreferrer">
                Learn more
            </Link.Anchor>.
            <svelte:fragment slot="aside">
                {#if entityPermissions}
                    <Permissions bind:permissions={entityPermissions} withCreate />
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button
                    disabled={arePermsDisabled}
                    on:click={async () => {
                        await updatePermissions(analytics, dependencies);
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>
    {/snippet}
</EntityContainer>
