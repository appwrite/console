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
    import { consoleVariables } from '$routes/(console)/store';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import RecordTable from '$lib/components/domains/recordTable.svelte';

    let {
        show = $bindable(false),
        selectedDomain
    }: {
        show: boolean;
        selectedDomain: Models.ProxyRule;
    } = $props();

    let isSubDomain = $derived.by(() =>
        selectedDomain?.domain?.length ? selectedDomain?.domain?.split('.')?.length >= 3 : false
    );

    let selectedTab = $state<'cname' | 'nameserver' | 'a' | 'aaaa'>('nameserver');
    $effect(() => {
        if ($consoleVariables._APP_DOMAIN_SITES && isSubDomain) {
            selectedTab = 'cname';
        } else if ($consoleVariables._APP_DOMAIN_TARGET_A) {
            selectedTab = 'a';
        } else if ($consoleVariables._APP_DOMAIN_TARGET_AAAA) {
            selectedTab = 'aaaa';
        }
    });

    let verified = $state(false);

    let error = $state(null);
    async function retryDomain() {
        try {
            const domain = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification(selectedDomain.$id);
            await invalidate(Dependencies.SITES_DOMAINS);
            verified = domain.status === 'verified';
            show = false;
            addNotification({
                type: 'success',
                message: `${selectedDomain.domain} has been verified`
            });
            trackEvent(Submit.DomainUpdateVerification);
        } catch (e) {
            error = e;
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
            {#if isSubDomain && !!$consoleVariables._APP_DOMAIN_SITES && $consoleVariables._APP_DOMAIN_SITES !== 'localhost'}
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
            {#if !!$consoleVariables._APP_DOMAIN_TARGET_A && $consoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1'}
                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'a')}
                    active={selectedTab === 'a'}>
                    A
                </Tabs.Item.Button>
            {/if}
            {#if !!$consoleVariables._APP_DOMAIN_TARGET_AAAA && $consoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1'}
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
        <NameserverTable domain={selectedDomain.domain} {verified} />
    {:else}
        <RecordTable
            {verified}
            service="sites"
            variant={selectedTab}
            domain={selectedDomain.domain} />
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Retry</Button>
    </svelte:fragment>
</Modal>
