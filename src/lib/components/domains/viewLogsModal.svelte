<script lang="ts">
    import { Modal } from '$lib/components';
    import { Logs } from '@appwrite.io/pink-svelte';
    import { app } from '$lib/stores/app';
    import { ProxyRuleStatus, type Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import { getApexDomain } from '$lib/helpers/tlds';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    let {
        show = $bindable(false),
        selectedProxyRule,
        domainsList
    }: {
        show: boolean;
        selectedProxyRule: Models.ProxyRule;
        domainsList?: Models.DomainsList;
    } = $props();

    let error = $state(null);

    async function retryDomain() {
        error = null;

        try {
            const apexDomain = getApexDomain(selectedProxyRule.domain);
            const domain = domainsList?.domains.find((d) => d.domain === apexDomain);
            if (isCloud && domain) {
                await sdk.forConsole.domains.updateNameservers({
                    domainId: domain.$id
                });
            }
        } catch {
            // Ignore error
        }

        try {
            selectedProxyRule = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({ ruleId: selectedProxyRule.$id });

            await invalidate(Dependencies.DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: 'Domain verified successfully'
            });
            trackEvent(Submit.DomainUpdateVerification);
        } catch (e) {
            error =
                e.message ??
                'Domain verification failed. Please check your domain settings or try again later';
            trackError(e, Submit.DomainUpdateVerification);
        }
    }

    $effect(() => {
        if (!show) {
            error = null;
        }
    });
</script>

<Modal
    title="Certificate logs"
    size="m"
    bind:show
    bind:error
    onSubmit={retryDomain}
    hideFooter={selectedProxyRule.status !== ProxyRuleStatus.Unverified}>
    <Logs logs={selectedProxyRule.logs} theme={$app.themeInUse} showScrollButton height="250px" />
    <svelte:fragment slot="footer">
        {#if selectedProxyRule.status === ProxyRuleStatus.Unverified}
            <Button submit>Retry</Button>
        {/if}
    </svelte:fragment>
</Modal>
