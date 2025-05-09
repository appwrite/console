<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { file } from './store';

    export let showDelete = false;
    let error: string;
    const deleteFile = async () => {
        try {
            const fileName = $file.name;
            await sdk.forProject.storage.deleteFile($file.bucketId, $file.$id);
            showDelete = false;
            await goto(`${base}/project-${page.params.project}/storage/bucket-${$file.bucketId}`);
            addNotification({
                type: 'success',
                message: `${fileName} has been deleted`
            });
            trackEvent(Submit.FileDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FileDelete);
        }
    };
</script>

<Confirm onSubmit={deleteFile} title="Delete file" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{$file.name}</b>?
    </Typography.Text>
</Confirm>
