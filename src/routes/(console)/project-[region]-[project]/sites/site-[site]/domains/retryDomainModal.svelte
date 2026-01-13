<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import { Divider, Tabs } from '@appwrite.io/pink-svelte';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import RecordTable from '$lib/components/domains/recordTable.svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { getApexDomain } from '$lib/helpers/tlds';

    let {
        show = $bindable(false),
        selectedProxyRule,
        domainsList
    }: {
        show: boolean;
        selectedProxyRule: Models.ProxyRule;
        domainsList?: Models.DomainsList;
    } = $props();

    const showCNAMETab = $derived(
        Boolean($regionalConsoleVariables._APP_DOMAIN_SITES) &&
            $regionalConsoleVariables._APP_DOMAIN_SITES !== 'localhost'
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
    let verified: boolean | undefined = $state(undefined);

    function getDefaultTab() {
        return showCNAMETab ? 'cname' : showATab ? 'a' : showAAAATab ? 'aaaa' : 'nameserver';
    }

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
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({ ruleId: selectedProxyRule.$id });

            verified = true;
            addNotification({
                type: 'success',
                message: 'Domain verified successfully'
            });

            await invalidate(Dependencies.SITES_DOMAINS);
            show = false;
            trackEvent(Submit.DomainUpdateVerification);
        } catch (e) {
            verified = false;
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

<Modal title="Retry verification" bind:show onSubmit={retryDomain} bind:error>
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
        <NameserverTable
            {verified}
            domain={selectedProxyRule.domain}
            ruleStatus={selectedProxyRule.status} />
    {:else}
        <RecordTable
            {verified}
            service="sites"
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
