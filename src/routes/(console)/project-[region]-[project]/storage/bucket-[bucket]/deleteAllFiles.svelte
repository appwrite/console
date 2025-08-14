<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { bucket } from './store';

    export let showDeleteAll = false;

    let error: string;

    async function deleteAllFiles() {
        try {
            const files = await sdk
                .forProject(page.params.region, page.params.project)
                .storage.listFiles(page.params.bucket);

            if (files.files.length === 0) {
                addNotification({
                    type: 'info',
                    message: 'No files to delete'
                });
                showDeleteAll = false;
                return;
            }

            const promises = files.files.map((file) =>
                sdk
                    .forProject(page.params.region, page.params.project)
                    .storage.deleteFile(file.bucketId, file.$id)
            );

            await Promise.all(promises);
            showDeleteAll = false;
            await invalidateAll();

            addNotification({
                type: 'success',
                message: `${files.files.length} file${files.files.length > 1 ? 's' : ''} in ${$bucket?.name || 'bucket'} have been deleted`
            });
            trackEvent(Submit.FileDeleteAll);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FileDeleteAll);
        }
    }
</script>

<Confirm onSubmit={deleteAllFiles} title="Delete all files" bind:open={showDeleteAll} bind:error>
    Are you sure you want to delete all files in {$bucket?.name || 'this bucket'}? This action is
    irreversible.
</Confirm>
