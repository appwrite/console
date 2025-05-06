<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import CnameTable from '$lib/components/domains/cnameTable.svelte';
    import { page } from '$app/state';

    let {
        show = $bindable(),
        selectedDomain
    }: {
        show: boolean;
        selectedDomain: Models.ProxyRule;
    } = $props();
    let error = $state(null);

    async function retryDomain() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification(selectedDomain.$id);
            await invalidate(Dependencies.DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: `${selectedDomain.domain} has been deleted`
            });
            trackEvent(Submit.DomainDelete);
        } catch (e) {
            error = e;
            trackError(e, Submit.DomainDelete);
        }
    }

    $effect(() => {
        if (!show) {
            error = null;
        }
    });
</script>

<Modal title="Retry verification" bind:show onSubmit={retryDomain} bind:error>
    {#if selectedDomain}
        <CnameTable
            domain={selectedDomain.domain}
            verified={selectedDomain.status === 'verified'} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Retry</Button>
    </svelte:fragment>
</Modal>
