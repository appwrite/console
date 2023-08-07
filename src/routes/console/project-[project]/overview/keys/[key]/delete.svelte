<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { key } from './store';

    export let showDelete = false;

    async function handleDelete() {
        try {
            await sdk.forConsole.projects.deleteKey($project.$id, $key.$id);
            await invalidate(Dependencies.KEYS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$key.name} ${$LL.components.notification.hasBeenDeleted()}`
            });
            trackEvent(Submit.KeyDelete);
            await goto(`${base}/console/project-${$project.$id}/overview/keys`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteApiKey()}</svelte:fragment>
    <p>{$LL.console.project.texts.overview.deletePermanent()}</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
