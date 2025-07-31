<script lang="ts">
    import { CardGrid, BoxAvatar } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { row } from '../store';
    import { addNotification } from '$lib/stores/notifications';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Delete from '../delete.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { table } from '../../store';
    import { page } from '$app/state';
    import { Alert } from '@appwrite.io/pink-svelte';

    let showDelete = false;
    let permissions = $row?.$permissions;

    let arePermsDisabled = true;
    let showPermissionAlert = true;

    async function updatePermissions() {
        try {
            const { $databaseId, $tableId, $id: rowId } = $row;

            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.updateRow($databaseId, $tableId, rowId, undefined, permissions);

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

    $: if (permissions) {
        arePermsDisabled = !symmetricDifference(permissions, $row.$permissions).length;
    }
</script>

<svelte:head>
    <title>Row - Appwrite</title>
</svelte:head>

<Container>
    <CardGrid>
        <svelte:fragment slot="title">Metadata</svelte:fragment>

        <svelte:fragment slot="aside">
            <div>
                <p>Created: {toLocaleDateTime($row.$createdAt)}</p>
                <p>Last updated: {toLocaleDateTime($row.$updatedAt)}</p>
            </div>
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <svelte:fragment slot="title">Permissions</svelte:fragment>

        <p>
            A user requires appropriate permissions at either the <b>table level</b> or
            <b>row level</b> to access a row. If no permissions are configured, no user can access
            the row
            <a
                href="https://appwrite.io/docs/products/databases/permissions"
                target="_blank"
                rel="noopener noreferrer"
                class="link">Learn more about database permissions</a
            >.
        </p>

        <svelte:fragment slot="aside">
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
                <Alert.Inline status="info" title="Document security is disabled">
                    If you want to assign row permissions. Go to Table settings and enable
                    row security. Otherwise, only table permissions will be used.
                </Alert.Inline>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePermsDisabled} on:click={updatePermissions}>Update</Button>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <svelte:fragment slot="title">Delete row</svelte:fragment>
        <p>
            The row will be permanently deleted, including all the data within it. This action is
            irreversible.
        </p>
        <svelte:fragment slot="aside">
            <BoxAvatar>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$row.$id}</h6>
                </svelte:fragment>
                <p>
                    Last updated: {toLocaleDateTime($row.$updatedAt)}
                </p>
            </BoxAvatar>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
