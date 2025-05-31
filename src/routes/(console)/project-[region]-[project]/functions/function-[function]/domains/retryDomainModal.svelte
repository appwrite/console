<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import RecordsCard from './recordsCard.svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';

    export let show = false;
    export let selectedProxyRule: Models.ProxyRule;

    let error = null;
    async function retryProxyRule() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification(selectedProxyRule.$id);
            await invalidate(Dependencies.SITES_DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: `${selectedProxyRule.domain} has been verified`
            });
            trackEvent(Submit.DomainUpdateVerification);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainUpdateVerification);
        }
    }

    $: if (!show) {
        error = null;
    }
</script>

<Modal title="Retry verification" bind:show onSubmit={retryProxyRule} bind:error>
    {#if selectedProxyRule}
        <RecordsCard proxyRule={selectedProxyRule} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Retry</Button>
    </svelte:fragment>
</Modal>
