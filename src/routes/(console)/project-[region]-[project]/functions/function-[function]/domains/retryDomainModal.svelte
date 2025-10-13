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

    let {
        show = $bindable(false),
        selectedProxyRule
    }: {
        show: boolean;
        selectedProxyRule: Models.ProxyRule;
    } = $props();

    let selectedTab = $state<'cname' | 'nameserver' | 'a' | 'aaaa'>('nameserver');

    $effect(() => {
        if ($regionalConsoleVariables._APP_DOMAIN_FUNCTIONS) {
            selectedTab = 'cname';
        } else if (!isCloud && $regionalConsoleVariables._APP_DOMAIN_TARGET_A) {
            selectedTab = 'a';
        } else if (!isCloud && $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA) {
            selectedTab = 'aaaa';
        } else {
            selectedTab = 'nameserver';
        }
    });

    let error = $state(null);
    let verified = $state(false);

    async function retryProxyRule() {
        try {
            const domain = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({ ruleId: selectedProxyRule.$id });

            verified = domain.status === 'verified';
            await invalidate(Dependencies.FUNCTION_DOMAINS);

            if (verified) {
                show = false;
                addNotification({
                    type: 'success',
                    message: `${selectedProxyRule.domain} has been verified`
                });
            } else {
                error =
                    'Domain verification failed. Please check your domain settings or try again later';
            }
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
            {#if !!$regionalConsoleVariables._APP_DOMAIN_FUNCTIONS && $regionalConsoleVariables._APP_DOMAIN_FUNCTIONS !== 'localhost'}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'cname')}
                    active={selectedTab === 'cname'}>
                    CNAME
                </Tabs.Item.Button>
            {/if}
            {#if isCloud}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'nameserver')}
                    active={selectedTab === 'nameserver'}>
                    Nameservers
                </Tabs.Item.Button>
            {/if}
            {#if !isCloud && !!$regionalConsoleVariables._APP_DOMAIN_TARGET_A && $regionalConsoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1'}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'a')}
                    active={selectedTab === 'a'}>
                    A
                </Tabs.Item.Button>
            {/if}
            {#if !isCloud && !!$regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA && $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1'}
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
            domain={selectedProxyRule.domain}
            {verified}
            ruleStatus={selectedProxyRule.status} />
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
