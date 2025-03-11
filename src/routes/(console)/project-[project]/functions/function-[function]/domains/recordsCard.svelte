<script lang="ts">
    import { Copy } from '$lib/components';
    import { Link } from '$lib/elements';
    import type { Domain } from '$lib/sdk/domains';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Layout, Typography, Table, Fieldset, Icon } from '@appwrite.io/pink-svelte';

    export let domain: Domain;
</script>

<Fieldset legend="Verification">
    <Layout.Stack gap="xl">
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Layout.Stack gap="s" direction="row" alignItems="center">
                    <Typography.Text variant="l-500">{domain?.domain}</Typography.Text>
                    <Badge variant="secondary" type="warning" content="Pending verification" />
                </Layout.Stack>
                <Typography.Text variant="m-400">
                    Add the following nameservers on your DNS provider. Note that DNS changes may
                    take time to propagate fully.
                </Typography.Text>
            </Layout.Stack>

            <Table.Root>
                <svelte:fragment slot="header">
                    <Table.Header.Cell>Type</Table.Header.Cell>
                    <Table.Header.Cell>Name</Table.Header.Cell>
                    <Table.Header.Cell>Value</Table.Header.Cell>
                </svelte:fragment>
                <Table.Row>
                    <Table.Cell>CNAME</Table.Cell>
                    <Table.Cell>{domain?.domain}</Table.Cell>
                    <Table.Cell>
                        <Copy value={globalThis?.location?.origin}
                            >{globalThis?.location?.origin}</Copy>
                    </Table.Cell>
                </Table.Row>
            </Table.Root>
            <Layout.Stack gap="s" direction="row" alignItems="center">
                <Icon icon={IconInfo} size="s" color="--fgcolor-neutral-secondary" />
                <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                    A list of all domain providers and their DNS setting is available <Link
                        variant="muted"
                        href="#">here</Link
                    >.
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
        <slot />
    </Layout.Stack>
</Fieldset>
