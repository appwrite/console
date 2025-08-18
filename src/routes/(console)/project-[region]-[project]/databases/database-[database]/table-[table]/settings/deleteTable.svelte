<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { table } from '../store';
    import { preferences } from '$lib/stores/preferences';

    export let showDelete = false;

    let error: string;
    const tableId = page.params.table;
    const databaseId = page.params.database;

    async function clearPreferences() {
        await Promise.all([
            preferences.deleteDisplayNames(tableId),
            preferences.deleteCustomTableColumns(tableId)
        ]);
    }

    async function handleDelete() {
        try {
            await sdk.forProject(page.params.region, page.params.project).grids.deleteTable({
                databaseId,
                tableId
            });

            await clearPreferences();
            await invalidate(Dependencies.DATABASE);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$table.name} has been deleted`
            });
            trackEvent(Submit.TableDelete);
            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}`
            );
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TableDelete);
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete table" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{$table.name}</b>?
    </Typography.Text>
</Confirm>
