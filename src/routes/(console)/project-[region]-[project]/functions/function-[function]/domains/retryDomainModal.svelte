<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import RecordsCard from './recordsCard.svelte';
    import type { Domain } from '$lib/sdk/domains';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';

    export let show = false;
    export let selectedDomain: Domain | Models.ProxyRule;

    let error = null;
    async function retryDomain() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification(selectedDomain.$id);
            await invalidate(Dependencies.SITES_DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: `${selectedDomain.domain} has been verified`
            });
            trackEvent(Submit.DomainDelete);
        } catch (e) {
            error = e;
            trackError(e, Submit.DomainDelete);
        }
    }

    $: if (!show) {
        error = null;
    }
</script>

<Modal title="Retry verification" bind:show onSubmit={retryDomain} bind:error>
    {#if selectedDomain}
        <RecordsCard domain={selectedDomain} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Retry</Button>
    </svelte:fragment>
</Modal>
