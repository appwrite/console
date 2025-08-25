<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { bucket } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    export let showDelete = false;
    let error: string;
    const onSubmit = async () => {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .storage.deleteBucket($bucket.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$bucket.name} has been deleted`
            });
            await goto(getProjectRoute('/storage'));
            trackEvent(Submit.BucketDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BucketDelete);
        }
    };
</script>

<Confirm {onSubmit} title="Delete bucket" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{$bucket.name}</b>?
    </Typography.Text>
</Confirm>
