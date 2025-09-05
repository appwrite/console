<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Permissions } from '$lib/components/permissions';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { table } from '../store';
    import { Link } from '@appwrite.io/pink-svelte';

    const databaseId = page.params.database;

    let arePermsDisabled = true;

    let tablePermissions: string[] = null;

    onMount(() => {
        tablePermissions ??= $table.$permissions;
    });

    async function updatePermissions() {
        try {
            await sdk.forProject(page.params.region, page.params.project).tablesDB.updateTable({
                databaseId,
                tableId: $table.$id,
                name: $table.name,
                permissions: tablePermissions,
                rowSecurity: $table.rowSecurity,
                enabled: $table.enabled
            });
            await invalidate(Dependencies.TABLE);
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.TableUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TableUpdatePermissions);
        }
    }

    $: arePermsDisabled = !(
        tablePermissions && symmetricDifference(tablePermissions, $table.$permissions).length
    );
</script>

<CardGrid>
    <svelte:fragment slot="title">Permissions</svelte:fragment>
    Choose who can access your tables and rows. <Link.Anchor
        href="https://appwrite.io/docs/products/databases/permissions"
        target="_blank"
        rel="noopener noreferrer">
        Learn more
    </Link.Anchor>.
    <svelte:fragment slot="aside">
        {#if tablePermissions}
            <Permissions bind:permissions={tablePermissions} withCreate />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button disabled={arePermsDisabled} on:click={updatePermissions}>Update</Button>
    </svelte:fragment>
</CardGrid>
