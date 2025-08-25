<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { table } from '../store';
    import { subNavigation } from '$lib/stores/database';
    import { preferences } from '$lib/stores/preferences';
    import { organization } from '$lib/stores/organization.js';

    export let showDelete = false;

    let error: string;

    async function handleDelete() {
        const tableId = page.params.table;
        const databaseId = page.params.database;

        try {
            await sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({
                databaseId,
                tableId
            });

            showDelete = false;
            subNavigation.update();

            addNotification({
                type: 'success',
                message: `${$table.name} has been deleted`
            });

            trackEvent(Submit.TableDelete);

            await Promise.all([
                preferences.deleteTableDetails($organization.$id, tableId),
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}`
                )
            ]);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TableDelete);
        }
    }
</script>

<Confirm
    confirmDeletion
    onSubmit={handleDelete}
    title="Delete table"
    bind:open={showDelete}
    bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{$table.name}</b>?
    </Typography.Text>
</Confirm>
