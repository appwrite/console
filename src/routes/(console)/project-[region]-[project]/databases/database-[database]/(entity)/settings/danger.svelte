<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { type DependenciesResult, EntityContainer } from '$database/(entity)';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { trackError, trackEvent } from '$lib/actions/analytics';
    import { BoxAvatar, CardGrid, Confirm } from '$lib/components';
    import { subNavigation } from '$lib/stores/database';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { navigate } from '$lib/stores/navigation';
    import { page } from '$app/state';
    import { organization } from '$lib/stores/organization';
    import type { AnalyticsResult, Entity } from '$database/(entity)/helpers';
    import { invalidate } from '$app/navigation';

    let {
        entity,
        onDelete
    }: {
        entity: Entity;
        onDelete: () => Promise<void>;
    } = $props();

    let show: boolean = $state(false);
    let error: string | null = $state(null);

    async function cleanup(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        show = false; // hide.
        subNavigation.update(); // update the side entity table.

        // events and notif!
        trackEvent(analytics.submit.entity('Delete'));
        addNotification({ type: 'success', message: `${entity.name} has been deleted` });

        // clear out!
        await Promise.all([
            preferences.deleteTableDetails($organization.$id, entity.$id),
            navigate(
                '/(console)/project-[region]-[project]/databases/database-[database]',
                page.params
            )
        ]);

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function deleteEntity(analytics: AnalyticsResult, dependencies: DependenciesResult) {
        try {
            await onDelete();
            await cleanup(analytics, dependencies);
        } catch (e) {
            error = e.message;
            trackError(e, analytics.submit.entity('Delete'));
        }
    }
</script>

<EntityContainer>
    {#snippet children(analytics, dependencies, terminology)}
        {@const type = terminology.entity.lower.singular}
        {@const records = terminology.record.lower.plural}
        <CardGrid>
            <svelte:fragment slot="title">Delete {type}</svelte:fragment>
            The {type} will be permanently deleted, including all the {records} within it. This action
            is irreversible.
            <svelte:fragment slot="aside">
                <BoxAvatar>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{entity.name}</h6>
                    </svelte:fragment>
                    <p>Last updated: {toLocaleDateTime(entity.$updatedAt)}</p>
                </BoxAvatar>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        show = true;
                        trackEvent(analytics.click.entity('Delete'));
                    }}>Delete</Button>
            </svelte:fragment>
        </CardGrid>

        {#if show}
            <Confirm
                confirmDeletion
                onSubmit={async () => await deleteEntity(analytics, dependencies)}
                title="Delete {type}"
                bind:open={show}
                bind:error>
                <Typography.Text>
                    Are you sure you want to delete <b>{entity.name}</b>?
                </Typography.Text>
            </Confirm>
        {/if}
    {/snippet}
</EntityContainer>
