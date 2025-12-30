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
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { isCloud } from '$lib/system';
    import { Divider, Tabs } from '@appwrite.io/pink-svelte';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import RecordTable from '$lib/components/domains/recordTable.svelte';

    let {
        show = $bindable(false),
        selectedProxyRule
    }: {
        show: boolean;
        selectedProxyRule: Models.ProxyRule;
    } = $props();

    const showCNAMETab = $derived(
        Boolean($regionalConsoleVariables._APP_DOMAIN_FUNCTIONS) &&
            $regionalConsoleVariables._APP_DOMAIN_FUNCTIONS !== 'localhost'
    );
    const showATab = $derived(
        !isCloud &&
            Boolean($regionalConsoleVariables._APP_DOMAIN_TARGET_A) &&
            $regionalConsoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1'
    );
    const showAAAATab = $derived(
        !isCloud &&
            Boolean($regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA) &&
            $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1'
    );
    const showNSTab = isCloud;

    let selectedTab = $state<'cname' | 'nameserver' | 'a' | 'aaaa'>(getDefaultTab());
    let error = $state(null);
    let verified = $state(false);

    function getDefaultTab() {
        return showCNAMETab ? 'cname' : showATab ? 'a' : showAAAATab ? 'aaaa' : 'nameserver';
    }

    async function retryProxyRule() {
        try {
            error = null;
            const proxyRule = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({ ruleId: selectedProxyRule.$id });

            verified = proxyRule.status === 'verified';
            await invalidate(Dependencies.FUNCTION_DOMAINS);

            // This means domain verification using DNS records hasn't succeeded and the rule is still in initial state.
            if (proxyRule.status === 'created') {
                throw new Error(
                    'Domain verification failed. Please check your domain settings or try again later'
                );
            }

            if (verified) {
                addNotification({
                    type: 'success',
                    message: `${selectedProxyRule.domain} has been verified`
                });
            } else {
                addNotification({
                    type: 'info',
                    message: 'Verification in progress'
                });
            }
            show = false;
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

<Modal title="Retry verification" bind:show onSubmit={retryProxyRule} bind:error>
    <div>
        <Tabs.Root variant="secondary" let:root>
            {#if showCNAMETab}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'cname')}
                    active={selectedTab === 'cname'}>
                    CNAME
                </Tabs.Item.Button>
            {/if}
            {#if showNSTab}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'nameserver')}
                    active={selectedTab === 'nameserver'}>
                    Nameservers
                </Tabs.Item.Button>
            {/if}
            {#if showATab}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'a')}
                    active={selectedTab === 'a'}>
                    A
                </Tabs.Item.Button>
            {/if}
            {#if showAAAATab}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'aaaa')}
                    active={selectedTab === 'aaaa'}>
                    AAAA
                </Tabs.Item.Button>
            {/if}
        </Tabs.Root>
        <Divider />
    </div>
    {#if selectedTab === 'nameserver'}
        <NameserverTable domain={selectedProxyRule.domain} {verified} />
    {:else}
        <RecordTable
            {verified}
            service="functions"
            variant={selectedTab}
            domain={selectedProxyRule.domain}
            ruleStatus={selectedProxyRule.status}
            onNavigateToNameservers={() => (selectedTab = 'nameserver')}
            onNavigateToA={() => (selectedTab = 'a')}
            onNavigateToAAAA={() => (selectedTab = 'aaaa')} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Retry</Button>
    </svelte:fragment>
</Modal>
