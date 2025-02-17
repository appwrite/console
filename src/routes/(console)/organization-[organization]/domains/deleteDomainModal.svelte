<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';

    export let show = false;
    export let selectedDomain: Models.ProxyRule;
    let confirm = false;

    async function deleteDomain() {
        try {
            await sdk.forProject.proxy.deleteRule(selectedDomain.$id);
            await invalidate(Dependencies.SITES_DOMAINS);
            show = false;
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

<Modal title="Delete domain" bind:show onSubmit={deleteDomain}>
    {#if selectedDomain}
        <p data-private>
            Are you sure you want to delete <b>{selectedDomain.domain}</b>? You will no longer be
            able to execute your function by visiting this domain.
        </p>
    {/if}
    <InputCheckbox
        required
        bind:checked={confirm}
        id="confirm"
        label="I understand and confirm"
        size="s" />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={!confirm}>Delete</Button>
    </svelte:fragment>
</Modal>
