<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { table } from '../store';

    const databaseId = page.params.database;

    let enabled: boolean = null;

    onMount(() => {
        enabled ??= $table.enabled;
    });

    async function toggleTable() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.updateTable(
                    databaseId,
                    $table.$id,
                    $table.name,
                    $table.$permissions,
                    $table.rowSecurity,
                    enabled
                );
            await invalidate(Dependencies.TABLE);
            addNotification({
                message: `${$table.name} has been updated`,
                type: 'success'
            });
            trackEvent(Submit.TableUpdateEnabled);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TableUpdateEnabled);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">{$table.name}</svelte:fragment>
    <svelte:fragment slot="aside">
        <ul>
            <InputSwitch
                id="toggle"
                label={enabled ? 'Enabled' : 'Disabled'}
                bind:value={enabled} />
        </ul>
        <div>
            <p>Created: {toLocaleDateTime($table.$createdAt)}</p>
            <p>Last updated: {toLocaleDateTime($table.$updatedAt)}</p>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={enabled === $table.enabled} on:click={toggleTable}>Update</Button>
    </svelte:fragment>
</CardGrid>
