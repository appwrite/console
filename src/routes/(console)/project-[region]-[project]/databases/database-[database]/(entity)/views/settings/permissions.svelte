<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Button } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { Link } from '@appwrite.io/pink-svelte';
    import { type Entity, getTerminologies } from '$database/(entity)';

    let {
        entity,
        onChangePermissions
    }: {
        entity: Entity;
        onChangePermissions: (permissions: string[]) => Promise<void>;
    } = $props();

    let entityPermissions: string[] = $state(entity.$permissions);

    const { analytics, dependencies, terminology } = getTerminologies();

    const type = terminology.entity.lower.singular;
    const records = terminology.record.lower.plural;

    async function cleanup() {
        // events and notif!
        trackEvent(analytics.submit.entity('UpdatePermissions'));
        addNotification({ message: `${entity.name} has been updated`, type: 'success' });

        // invalidate proper dependency.
        await invalidate(dependencies.entity.singular);
    }

    async function updatePermissions() {
        try {
            await onChangePermissions(entityPermissions);
            await cleanup();
        } catch (error) {
            addNotification({ message: error.message, type: 'error' });
            trackError(error, analytics.submit.entity('UpdatePermissions'));
        }
    }

    const arePermsDisabled = $derived(
        !(entityPermissions && symmetricDifference(entityPermissions, entity.$permissions).length)
    );
</script>

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
        <Button disabled={arePermsDisabled} on:click={updatePermissions}>Update</Button>
    </svelte:fragment>
</CardGrid>
