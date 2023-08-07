<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    const functionId = $page.params.function;

    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.delete(functionId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: $LL.components.notification.functionDeleted()
            });
            await goto(`${base}/console/project-${$page.params.project}/functions`);
            trackEvent(Submit.FunctionDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionDelete);
        }
    };
</script>

<Modal
    bind:show={showDelete}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteFunction()}</svelte:fragment>
    <p data-private>
        {$LL.console.project.texts.functions.permanentDelete()}
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
