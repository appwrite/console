<script lang="ts">
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

    import { Badge, Layout, Typography, Table, InteractiveText } from '@appwrite.io/pink-svelte';

    export let domain: string;
    export let verified: boolean | undefined = undefined;
    export let ruleStatus: string | undefined = undefined;

    const nameserverList = $regionalConsoleVariables?._APP_DOMAINS_NAMESERVERS
        ? $regionalConsoleVariables?._APP_DOMAINS_NAMESERVERS?.split(',')
        : ['ns1.appwrite.io', 'ns2.appwrite.io'];
</script>

<Layout.Stack gap="s">
    <Layout.Stack gap="s" direction="row" alignItems="center">
        <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
            {domain}
        </Typography.Text>
        {#if ruleStatus === 'created'}
            <Badge variant="secondary" type="error" size="xs" content="Verification failed" />
        {:else if ruleStatus === 'verifying'}
            <Badge variant="secondary" size="xs" content="Generating certificate" />
        {:else if ruleStatus === 'unverified'}
            <Badge
                variant="secondary"
                type="error"
                size="xs"
                content="Certificate generation failed" />
        {:else if verified === true}
            <Badge variant="secondary" type="success" size="xs" content="Verified" />
        {/if}
    </Layout.Stack>
    <Typography.Text variant="m-400">
        Add the following nameservers on your DNS provider. Note that changes may take up to 48
        hours to propagate fully.
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
