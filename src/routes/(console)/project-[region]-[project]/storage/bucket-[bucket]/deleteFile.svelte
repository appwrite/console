<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { Typography, Layout } from '@appwrite.io/pink-svelte';

    export let file: Models.File;
    export let showDelete = false;
    let error: string;
    const dispatch = createEventDispatcher();

    const onSubmit = async () => {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .storage.deleteFile(file.bucketId, file.$id);
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
    <Layout.Stack gap="l">
        <Typography.Text variant="m-400">
            Are you sure you want to delete the following file?
        </Typography.Text>

        <div
            class="u-flex u-flex-wrap u-gap-8 u-main-space-between u-cross-center u-padding-16 u-border u-radius">
            <Layout.Stack gap="xs">
                <Typography.Text variant="m-600" data-private>{file.name}</Typography.Text>
                <Layout.Stack direction="row" gap="s" alignItems="center">
                    <Typography.Text variant="m-400" class="u-color-text-secondary">
                        {file.mimeType}
                    </Typography.Text>
                    <span class="u-color-text-secondary">•</span>
                    <Typography.Text variant="m-400" class="u-color-text-secondary">
                        {calculateSize(file.sizeOriginal)}
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </div>

        <Typography.Text variant="m-400" class="u-color-text-secondary">
            This action cannot be undone. The file will be permanently deleted from your storage
            bucket.
        </Typography.Text>
    </Layout.Stack>
</Confirm>
