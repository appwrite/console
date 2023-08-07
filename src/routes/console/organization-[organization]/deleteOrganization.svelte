<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { organization, organizationList } from '$lib/stores/organization';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;

    async function deleteOrg() {
        try {
            await sdk.forConsole.teams.delete($organization.$id);
            await invalidate(Dependencies.ACCOUNT);
            addNotification({
                type: 'success',
                message: `${$organization.name} ${$LL.components.notification.hasBeenUpdated()}`
            });
            trackEvent(Submit.OrganizationDelete);
            if ($organizationList?.total > 1) {
                goto(`${base}/console/`);
            } else {
                goto(`${base}/console/onboarding`);
            }
            showDelete = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationDelete);
        }
    }
</script>

<Modal
    onSubmit={deleteOrg}
    bind:show={showDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header"
        >{$LL.console.organization.forms.deleteOrg.title()}</svelte:fragment>
    <p>
        {$LL.console.organization.forms.deleteOrg.texts.phraseOne()}{' '}<b>{$organization.name}</b
        >{$LL.console.organization.forms.deleteOrg.texts.phraseTwo()}{' '}({$organization.total}){' '}
        {$LL.console.organization.forms.deleteOrg.texts.phraseThree()}
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.organization.button.submit.cancel()}</Button>
        <Button secondary submit>{$LL.console.organization.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
