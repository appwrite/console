<script lang="ts">
    import CnameTable from '$lib/components/domains/cnameTable.svelte';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { Divider, Fieldset, Layout, Tabs } from '@appwrite.io/pink-svelte';

    export let domain: string;
    export let verified: boolean;

    $: isSubDomain = domain?.split('.')?.length >= 3;
    export let selectedTab: 'cname' | 'nameserver' =
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
            </Tabs.Root>
            <Divider />
        </div>
        {#if selectedTab === 'cname' && isSubDomain}
            <CnameTable {domain} {verified} />
        {:else if isCloud}
            <NameserverTable {domain} {verified} />
        {/if}
        <slot />
    </Layout.Stack>
</Fieldset>
