<script lang="ts">
    import CnameTable from '$lib/components/domains/cnameTable.svelte';
    import { consoleVariables } from '$routes/(console)/store';
    import {
        Badge,
        Divider,
        Fieldset,
        InteractiveText,
        Layout,
        Table,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';

    export let domain: string;
    export let verified: boolean;

    const nameserverList = $consoleVariables?._APP_DOMAINS_NAMESERVERS
        ? $consoleVariables?._APP_DOMAINS_NAMESERVERS.split(',')
        : ['ns1.appwrite.io', 'ns2.appwrite.io'];

    $: isSubDomain = domain?.split('.')?.length >= 3;
    export let selectedTab: 'cname' | 'nameserver' = isSubDomain ? 'cname' : 'nameserver';
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

                <Tabs.Item.Button
                    {root}
                    on:click={() => (selectedTab = 'nameserver')}
                    active={selectedTab === 'nameserver'}>
                    Nameservers
                </Tabs.Item.Button>
            </Tabs.Root>
            <Divider />
        </div>
        {#if selectedTab === 'cname' && isSubDomain}
            <CnameTable {domain} {verified} />
        {:else}
            <Layout.Stack gap="s">
                <Layout.Stack gap="s" direction="row" alignItems="center">
                    <Typography.Text variant="l-500" color="--fgcolor-neutral-primary"
                        >{domain}</Typography.Text>
                    <Badge
                        variant="secondary"
                        type="warning"
                        size="xs"
                        content="Pending verification" />
                </Layout.Stack>
                <Typography.Text variant="m-400">
                    Add the following nameservers on your DNS provider. Note that DNS changes may
                    take time to propagate fully.
                </Typography.Text>
            </Layout.Stack>

            <Table.Root columns={2} let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell {root}>Type</Table.Header.Cell>
                    <Table.Header.Cell {root}>Value</Table.Header.Cell>
                </svelte:fragment>
                {#each nameserverList as nameserver}
                    <Table.Row.Base {root}>
                        <Table.Cell {root}>NS</Table.Cell>
                        <Table.Cell {root}>
                            <InteractiveText variant="copy" isVisible text={nameserver}>
                                {nameserver}</InteractiveText>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
        {/if}
        <slot />
    </Layout.Stack>
</Fieldset>
