<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Alert } from '@appwrite.io/pink-svelte';
    import { Permissions } from '$lib/components/permissions';
    import { addNotification } from '$lib/stores/notifications';
    import { symmetricDifference } from '$lib/helpers/array';
    import { trackEvent, trackError } from '$lib/actions/analytics';
    import {
        type Entity,
        type Record,
        getTerminologies,
        toSupportiveRecord
    } from '$database/(entity)';

    let {
        entity,
        record = $bindable(null)
    }: {
        entity: Entity;
        record: Record;
    } = $props();

    let permissions = $state(record.$permissions);

    let arePermsDisabled = $state(true);
    let showPermissionAlert = $state(true);

    const { analytics, dependencies, terminology } = getTerminologies();
    const entityTerm = terminology.entity.lower.singular;
    const recordTerm = terminology.record.lower.singular;

    const entityTermTitle = terminology.entity.title.singular;
    const recordTermTitle = terminology.record.title.singular;

    export function disableSubmit() {
        return arePermsDisabled;
    }

    export async function updatePermissions() {
        try {
            const { $databaseId: databaseId, $id: recordId, entityId } = toSupportiveRecord(record);

            if (terminology.type === 'documentsdb') {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .documentsDB.updateDocument({
                        databaseId,
                        collectionId: entityId,
                        documentId: recordId,
                        permissions
                    });
            } else {
                await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({
                    databaseId,
                    tableId: entityId,
                    rowId: recordId,
                    permissions
                });
            }

            arePermsDisabled = true;
            await invalidate(dependencies.record.plural);
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });

            trackEvent(analytics.submit.record('UpdatePermissions'));
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, analytics.submit.record('UpdatePermissions'));
        }
    }

    $effect(() => {
        if (permissions) {
            arePermsDisabled = !symmetricDifference(permissions, record.$permissions).length;
        }
    });
</script>

<p>
    A user requires appropriate permissions at either the <b>{entityTerm} level</b> or
    <b>{recordTerm} level</b> to access a {recordTerm}. If no permissions are configured, no user
    can access the {recordTerm}
    <a
        href="https://appwrite.io/docs/products/databases/permissions"
        target="_blank"
        rel="noopener noreferrer"
        class="link">Learn more about database permissions</a
    >.
</p>

{#if entity.recordSecurity}
    {#if showPermissionAlert}
        <Alert.Inline
            status="info"
            title="{recordTermTitle} security is enabled"
            dismissible
            on:dismiss={() => (showPermissionAlert = false)}>
            Users will be able to access this {recordTerm} if they have been granted
            <b>either {recordTerm} or {entityTerm} permissions.</b>
        </Alert.Inline>
    {/if}
    {#if permissions}
        <Permissions bind:permissions />
    {/if}
{:else}
    <Alert.Inline status="info" title="{recordTermTitle} security is disabled">
        If you want to assign {recordTerm} permissions. Go to {entityTermTitle} settings and enable {recordTerm}
        security. Otherwise, only {entityTerm} permissions will be used.
    </Alert.Inline>
{/if}
