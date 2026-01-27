<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';
    import ActionRequiredTable from '$lib/components/domains/actionRequiredTable.svelte';

    let {
        show = $bindable(false),
        selectedProxyRule
    }: {
        show: boolean;
        selectedProxyRule: Models.ProxyRule;
    } = $props();

    let error = $state(null);

    async function verify() {
        error = null;

        try {
            selectedProxyRule = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({
                    ruleId: selectedProxyRule.$id,
                    type: 'managed_dns'
                });

            await invalidate(Dependencies.SITES_DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: 'Domain verified successfully'
            });
            trackEvent(Submit.DomainUpdateVerification);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainUpdateVerification);
        }
    }

    $effect(() => {
        if (!show) {
            error = null;
        }
    });
</script>

<Modal title="Action required" bind:show onSubmit={verify} bind:error>
    <ActionRequiredTable proxyRule={selectedProxyRule} />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Verify</Button>
    </svelte:fragment>
</Modal>
