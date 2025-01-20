<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import RecordsCard from './recordsCard.svelte';

    export let show = false;
    export let selectedDomain: Models.ProxyRule;

    async function retryDomain() {
        try {
            await sdk.forProject.proxy.updateRuleVerification(selectedDomain.$id);
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

<Modal title="Retry verification" bind:show onSubmit={retryDomain}>
    {#if selectedDomain}
        <RecordsCard domain={selectedDomain} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Retry</Button>
    </svelte:fragment>
</Modal>
