<script lang="ts">
    import { Badge, Layout, Typography, Table, InteractiveText } from '@appwrite.io/pink-svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import CnameAlert from './cnameAlert.svelte';

    export let domain: string;
    export let verified = undefined;

    let subdomain = domain.split('.').slice(0, -2).join('.');
</script>

<Layout.Stack gap="xl">
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
                {domain}
            </Typography.Text>
            {#if verified === true}
                <Badge variant="secondary" type="success" size="xs" content="Verified" />
            {:else if verified === false}
                <Badge variant="secondary" type="warning" size="xs" content="Verification failed" />
            {/if}
        </Layout.Stack>
        <Typography.Text variant="m-400">
            Add the following record on your DNS provider. Note that DNS changes may take time to
            propagate fully.
        </Typography.Text>
    </Layout.Stack>

    <Table.Root columns={3} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Type</Table.Header.Cell>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Value</Table.Header.Cell>
        </svelte:fragment>
        <Table.Row.Base {root}>
            <Table.Cell {root}>CNAME</Table.Cell>
            <Table.Cell {root}>{subdomain}</Table.Cell>
            <Table.Cell {root}>
                <InteractiveText
                    variant="copy"
                    isVisible
                    text={$regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME} />
            </Table.Cell>
        </Table.Row.Base>
    </Table.Root>
    <Layout.Stack gap="s" direction="row" alignItems="center">
        <CnameAlert />
    </Layout.Stack>
</Layout.Stack>
