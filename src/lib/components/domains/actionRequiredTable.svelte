<script lang="ts">
    import { Layout, Typography, Table, InteractiveText } from '@appwrite.io/pink-svelte';
    import { type Models } from '@appwrite.io/console';

    let { proxyRule }: { proxyRule: Models.ProxyRule } = $props();
</script>

<Layout.Stack gap="xl">
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
                {proxyRule.domain}
            </Typography.Text>
        </Layout.Stack>
        <Typography.Text variant="m-400">
            Add the following {proxyRule.actions.length > 1 ? 'records' : 'record'} on your DNS provider.
            Note that DNS changes may take up to 48 hours to propagate fully.
        </Typography.Text>
    </Layout.Stack>

    <Table.Root
        columns={[
            { id: 'type', width: { min: 150 } },
            { id: 'name', width: { min: 80 } },
            { id: 'value', width: { min: 100 } }
        ]}
        let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
            <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
            <Table.Header.Cell column="value" {root}>Value</Table.Header.Cell>
        </svelte:fragment>
        {#each proxyRule.actions as action}
            <Table.Row.Base {root}>
                <Table.Cell column="type" {root}>{action['recordType']}</Table.Cell>
                <Table.Cell column="name" {root}>
                    <InteractiveText variant="copy" isVisible text={action['recordName']} />
                </Table.Cell>
                <Table.Cell column="value" {root}>
                    <InteractiveText variant="copy" isVisible text={action['recordValue']} />
                </Table.Cell>
            </Table.Row.Base>
        {/each}
    </Table.Root>
</Layout.Stack>
