<script lang="ts">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;
    export let keyIds: string[] = [];
    export let keyType: 'api' | 'dev' = 'api';

    const projectId = page.params.project;

    const isApiKey = keyType === 'api';
    const label = isApiKey ? 'API' : 'dev';
    const slug = isApiKey ? 'keys' : 'dev-keys';
    const event = isApiKey ? Submit.KeyDelete : Submit.DevKeyDelete;
    const dependency = isApiKey ? Dependencies.KEYS : Dependencies.DEV_KEYS;

    let error: string;

    async function handleDelete() {
        try {
            await Promise.all(
                keyIds.map((key) =>
                    isApiKey
                        ? sdk.forConsole.projects.deleteKey(projectId, key)
                        : sdk.forConsole.projects.deleteDevKey(projectId, key)
                )
            );

            await invalidate(dependency);
            showDelete = false;

            addNotification({
                type: 'success',
                message: `${keyIds.length} ${label} key${keyIds.length > 1 ? 's' : ''} deleted`
            });

            trackEvent(event);
            await goto(`${base}/project-${projectId}/overview/${slug}`);
        } catch (e) {
            error = e.message;
            trackError(e, event);
        } finally {
            keyIds = [];
        }
    }
</script>

<Confirm onSubmit={handleDelete} title={`Delete ${label} key`} bind:open={showDelete} bind:error>
    <p>
        Are you sure you want to delete <b>{keyIds.length}</b>
        {label} key{keyIds.length > 1 ? 's' : ''}?
    </p>
</Confirm>
