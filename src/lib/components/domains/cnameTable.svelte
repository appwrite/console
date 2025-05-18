<script lang="ts">
    import { Link } from '$lib/elements';
    import { consoleVariables } from '$routes/(console)/store';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import {
        Badge,
        Layout,
        Typography,
        Table,
        Icon,
        InteractiveText
    } from '@appwrite.io/pink-svelte';

    export let domain: string;
    export let verified = false;

    let subdomain = domain.split('.').slice(0, -2).join('.');
</script>

<Layout.Stack gap="xl">
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
                {domain}
            </Typography.Text>
            {#if verified}
                <Badge variant="secondary" type="success" content="Verified" />
            {:else if verified === false}
                <Badge variant="secondary" type="error" content="Verification failed" />
            {:else}
                <Badge
                    variant="secondary"
                    type="warning"
                    size="xs"
                    content="Pending verification" />
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
                    text={$consoleVariables._APP_DOMAIN_TARGET_CNAME} />
            </Table.Cell>
        </Table.Row.Base>
    </Table.Root>
    <Layout.Stack gap="s" direction="row" alignItems="center">
        <Icon icon={IconInfo} size="s" color="--fgcolor-neutral-secondary" />
        <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
            A list of all domain providers and their DNS setting is available <Link
                variant="muted"
                external
                href="https://appwrite.io/docs/advanced/platform/custom-domains">here</Link
            >.
        </Typography.Text>
    </Layout.Stack>
</Layout.Stack>
