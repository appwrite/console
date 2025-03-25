<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import type { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';

    export let showDelete = false;
    export let selectedDomain: Models.ProxyRule;
    export let dependency: Dependencies;

    async function deleteDomain() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .proxy.deleteRule(selectedDomain.$id);
            await invalidate(dependency);
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
    title="Delete domain"
    bind:show={showDelete}
    onSubmit={deleteDomain}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    {#if selectedDomain}
        <p data-private>
            Are you sure you want to delete <b>{selectedDomain.domain}</b>? You will no longer be
            able to execute your function by visiting this domain.
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
