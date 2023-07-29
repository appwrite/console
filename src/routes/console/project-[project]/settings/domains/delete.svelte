<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { project } from '../../store';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;
    export let selectedDomain: Models.Domain;

    async function deleteDomain() {
        try {
            await sdk.forConsole.projects.deleteDomain($project.$id, selectedDomain.$id);
            await invalidate(Dependencies.DOMAINS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${selectedDomain.domain} has been deleted`
            });
            trackEvent(Submit.DomainDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DomainDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteDomain}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteDomain()}</svelte:fragment>
    {#if selectedDomain}
        <p data-private>
            {$LL.console.project.texts.consoleSettings.delete.phraseOne()}{' '}<b
                >{selectedDomain.domain}</b
            >{' '}{$LL.console.project.texts.consoleSettings.delete.from()}{' '}'{$project.name}'?
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
