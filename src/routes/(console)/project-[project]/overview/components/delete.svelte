<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';
    import { project } from '../../store';

    export let showDelete = false;
    export let key: Models.Key | Models.DevKey;
    export let resourceType: 'API' | 'Dev' = 'API';

    $: isTypeApiKey = resourceType === 'API';

    async function handleDelete() {
        try {
            const actions = {
                delete: isTypeApiKey
                    ? () => sdk.forConsole.projects.deleteKey($project.$id, key.$id)
                    : () => sdk.forConsole.projects.deleteDevKey($project.$id, key.$id),
                invalidate: isTypeApiKey ? Dependencies.KEYS : Dependencies.DEV_KEYS,
                trackDelete: isTypeApiKey ? Submit.KeyDelete : Submit.DevKeyDelete,
                redirectPath: `${base}/project-${$project.$id}/overview/${isTypeApiKey ? 'keys' : 'dev-keys'}`
            };

            await actions.delete();
            await invalidate(actions.invalidate);

            showDelete = false;

            addNotification({
                type: 'success',
                message: `${key.name} has been deleted`
            });

            trackEvent(actions.trackDelete);
            await goto(actions.redirectPath);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });

            trackError(error, isTypeApiKey ? Submit.KeyDelete : Submit.DevKeyDelete);
        }
    }
</script>

<Modal
    title="Delete {resourceType} key"
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p>The {resourceType} key will be permanently deleted. This action is irreversible.</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
