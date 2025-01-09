<script lang="ts">
    import { Copy } from '$lib/components';
    import Card from '$lib/components/card.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Typography, Table } from '@appwrite.io/pink-svelte';

    export let domain: Models.ProxyRule;
</script>

<Card radius="s" padding="s" isTile>
    <Layout.Stack gap="s">
        <Layout.Stack gap="s" direction="row" alignItems="center">
            <Typography.Text variant="l-500">{domain.domain}</Typography.Text>
            <Badge variant="secondary" type="warning" content="Pending verification" />
        </Layout.Stack>
        <p>
            Add the following record with your DNS provider. Note that changes may take up to 48
            hours to take effect. You can periodically check the verification status in your domain
            settings.
        </p>

        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Type</Table.Header.Cell>
                <Table.Header.Cell>Name</Table.Header.Cell>
                <Table.Header.Cell>Value</Table.Header.Cell>
            </svelte:fragment>
            <Table.Row>
                <Table.Cell>CNAME</Table.Cell>
                <Table.Cell>{domain.domain}</Table.Cell>
                <Table.Cell>
                    <Copy value={globalThis?.location?.origin}>{globalThis?.location?.origin}</Copy>
                </Table.Cell>
            </Table.Row>
        </Table.Root>
    </Layout.Stack>
    <slot />
</Card>
