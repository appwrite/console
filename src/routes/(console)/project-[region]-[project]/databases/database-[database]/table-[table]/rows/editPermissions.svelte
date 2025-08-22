<script lang="ts">
    import { table } from '../store';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Alert } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { Permissions } from '$lib/components/permissions';
    import { addNotification } from '$lib/stores/notifications';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    let {
        row = $bindable(null)
    }: {
        row: Models.DefaultRow | Models.Row;
    } = $props();

    let permissions = $state(row.$permissions);
    let arePermsDisabled = $state(true);
    let showPermissionAlert = $state(true);

    export function disableSubmit() {
        return arePermsDisabled;
    }

    export async function updatePermissions() {
        try {
            const { $databaseId: databaseId, $tableId: tableId, $id: rowId } = row;

            await sdk.forProject(page.params.region, page.params.project).tablesDb.updateRow({
                databaseId,
                tableId,
                rowId,
                permissions
            });

            await invalidate(Dependencies.ROW);
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.RowUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.RowUpdatePermissions);
        }
    }

    $effect(() => {
        if (permissions) {
            arePermsDisabled = !symmetricDifference(permissions, row.$permissions).length;
        }
    });
</script>

<p>
    A user requires appropriate permissions at either the <b>table level</b> or
    <b>row level</b> to access a row. If no permissions are configured, no user can access the row
    <a
        href="https://appwrite.io/docs/products/databases/permissions"
        target="_blank"
        rel="noopener noreferrer"
        class="link">Learn more about database permissions</a
    >.
</p>

{#if $table.rowSecurity}
    {#if showPermissionAlert}
        <Alert.Inline
            status="info"
            title="Row security is enabled"
            dismissible
            on:dismiss={() => (showPermissionAlert = false)}>
            Users will be able to access this row if they have been granted <b
                >either row or table permissions.</b>
        </Alert.Inline>
    {/if}
    {#if permissions}
        <Permissions bind:permissions />
    {/if}
{:else}
    <Alert.Inline status="info" title="Row security is disabled">
        If you want to assign row permissions. Go to Table settings and enable row security.
        Otherwise, only table permissions will be used.
    </Alert.Inline>
{/if}
