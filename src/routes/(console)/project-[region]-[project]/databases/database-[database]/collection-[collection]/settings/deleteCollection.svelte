<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { collection } from '../store';
    import { getProjectRoute } from '$lib/helpers/project';

    export let showDelete = false;

    const databaseId = page.params.database;
    let error: string;

    async function handleDelete() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.deleteCollection(databaseId, $collection.$id);
            await invalidate(Dependencies.DATABASE);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$collection.name} has been deleted`
            });
            trackEvent(Submit.CollectionDelete);
            await goto(getProjectRoute(`/databases/database-${page.params.database}`));
        } catch (e) {
            error = e.message;
            trackError(e, Submit.CollectionDelete);
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete collection" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{$collection.name}</b>?
    </Typography.Text>
</Confirm>
