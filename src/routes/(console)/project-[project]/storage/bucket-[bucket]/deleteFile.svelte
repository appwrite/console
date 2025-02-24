<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let file: Models.File;
    export let showDelete = false;
    let error: string;
    const dispatch = createEventDispatcher();

    const onSubmit = async () => {
        try {
            await sdk.forProject.storage.deleteFile(file.bucketId, file.$id);
            showDelete = false;
            dispatch('deleted', file);
            addNotification({
                type: 'success',
                message: `${file.name} has been deleted`
            });
            trackEvent(Submit.FileDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FileDelete);
        }
    };
</script>

<Confirm {onSubmit} title="Delete file" bind:open={showDelete} bind:error>
    Are you sure you want to delete <b>{file.name}</b>?
</Confirm>
