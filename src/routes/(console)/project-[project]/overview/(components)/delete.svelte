<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';
    import { page } from '$app/stores';

    export let showDelete = false;
    export let keyType: 'api' | 'dev' = 'api';
    export let key: Models.DevKey | Models.Key;

    const projectId = $page.params.project;

    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'Dev';
    const slug = isApiKey ? 'keys' : 'dev-keys';
    const event = isApiKey ? Submit.KeyDelete : Submit.DevKeyDelete;
    const dependency = isApiKey ? Dependencies.KEYS : Dependencies.DEV_KEYS;

    let error: string;

    async function handleDelete() {
        try {
            isApiKey
                ? await sdk.forConsole.projects.deleteKey(projectId, key.$id)
                : await sdk.forConsole.projects.deleteDevKey(projectId, key.$id);

            await invalidate(dependency);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${key.name} has been deleted`
            });
            trackEvent(event);
            await goto(`${base}/project-${projectId}/overview/${slug}`);
        } catch (e) {
            error = e.message;
            trackError(e, event);
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete {label} key" bind:open={showDelete} bind:error>
    Are you sure you want to delete this key?
</Confirm>
