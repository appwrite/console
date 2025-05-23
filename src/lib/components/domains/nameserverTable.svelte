<script lang="ts">
    import { consoleVariables } from '$routes/(console)/store';

    import { Badge, Layout, Typography, Table, InteractiveText } from '@appwrite.io/pink-svelte';

    export let domain: string;
    export let verified = false;

    const nameserverList = $consoleVariables?._APP_DOMAINS_NAMESERVERS
        ? $consoleVariables?._APP_DOMAINS_NAMESERVERS?.split(',')
        : ['ns1.appwrite.io', 'ns2.appwrite.io'];
</script>

<Layout.Stack gap="s">
    <Layout.Stack gap="s" direction="row" alignItems="center">
        <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
            {domain}
        </Typography.Text>
        {#if verified}
            <Badge variant="secondary" type="success" size="xs" content="Verified" />
        {:else if verified === false}
            <Badge variant="secondary" type="warning" size="xs" content="Pending verification" />
        {/if}
    </Layout.Stack>
    <Typography.Text variant="m-400">
        Add the following nameservers on your DNS provider. Note that DNS changes may take time to
        propagate fully.
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
                <InteractiveText variant="copy" isVisible text={nameserver} />
            </Table.Cell>
        </Table.Row.Base>
    {/each}
</Table.Root>
