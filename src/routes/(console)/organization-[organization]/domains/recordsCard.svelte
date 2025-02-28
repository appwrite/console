<script lang="ts">
    import { Copy } from '$lib/components';
    import { Link } from '$lib/elements';
    import type { Domain } from '$lib/sdk/domains';
    import { consoleVariables } from '$routes/(console)/store';
    import { IconDuplicate, IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Layout, Typography, Table, Fieldset, Icon } from '@appwrite.io/pink-svelte';

    export let domain: Domain;

    $: console.log($consoleVariables._APP_DOMAINS_NAMESERVERS);

    // TODO: split _APP_DOMAINS_NAMESERVERS?
    let nameservers = $consoleVariables?._APP_DOMAINS_NAMESERVERS ?? [
        'ns1.appwrite.io',
        'ns2.appwrite.io'
    ];

    $: verified = domain.nameservers === nameservers;
</script>

<Fieldset legend="Verification">
    <Layout.Stack gap="xl">
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Layout.Stack gap="s" direction="row" alignItems="center">
                    <Typography.Text variant="l-500">{domain.domain}</Typography.Text>

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
                    <Table.Header.Cell>Value</Table.Header.Cell>
                    <Table.Header.Cell />
                </svelte:fragment>
                {#each nameservers as nameserver}
                    <Table.Row>
                        <Table.Cell>NS</Table.Cell>
                        <Table.Cell>{nameserver}</Table.Cell>
                        <Table.Cell>
                            <Layout.Stack alignItems="flex-end">
                                <Copy value={nameserver}>
                                    <Icon icon={IconDuplicate} />
                                </Copy>
                            </Layout.Stack>
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Root>
            <Layout.Stack gap="s" direction="row" alignItems="center">
                <Icon icon={IconInfo} size="s" color="--color-fgcolor-neutral-secondary" />
                <Typography.Text variant="m-400" color="--color-fgcolor-neutral-secondary">
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
