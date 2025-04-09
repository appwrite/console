<script lang="ts">
    import CnameTable from '$lib/components/domains/cnameTable.svelte';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import RecordTable from '$lib/components/domains/recordTable.svelte';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { Divider, Fieldset, Layout, Tabs } from '@appwrite.io/pink-svelte';

    export let domain: string;
    export let verified: boolean;

    $: isSubDomain = domain?.split('.')?.length >= 3;
    export let selectedTab: 'cname' | 'nameserver' | 'a' | 'aaaa' =
        isSubDomain || isSelfHosted ? 'cname' : 'nameserver';
</script>

<Fieldset legend="Verification">
    <Layout.Stack gap="xl">
        <div>
            <Tabs.Root variant="secondary" let:root>
                {#if isSubDomain}
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
            <NameserverTable {domain} {verified} />
        {:else}
            <RecordTable {domain} {verified} variant={selectedTab} />
        {/if}
        <slot />
    </Layout.Stack>
</Fieldset>
