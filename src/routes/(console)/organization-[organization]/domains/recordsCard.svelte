<script lang="ts">
    import { Copy } from '$lib/components';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import type { Domain } from '$lib/sdk/domains';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { consoleVariables } from '$routes/(console)/store';
    import { IconDuplicate, IconInfo } from '@appwrite.io/pink-icons-svelte';
    import {
        Badge,
        Layout,
        Typography,
        Table,
        Fieldset,
        Icon,
        Divider
    } from '@appwrite.io/pink-svelte';

    export let domain: Domain;

    let verified = undefined;

    // TODO: split _APP_DOMAINS_NAMESERVERS?
    let nameservers = $consoleVariables?._APP_DOMAINS_NAMESERVERS.split(',') ?? [
        'ns1.appwrite.io',
        'ns2.appwrite.io'
    ];

    async function verifyStatus() {
        try {
            domain = await sdk.forConsole.domains.updateNameservers(domain.$id);
            verified = domain.nameservers === nameservers;
            console.log(domain);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function back() {
        try {
            await sdk.forConsole.domains.delete(domain.$id);
            domain = undefined;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    $: console.log($consoleVariables._APP_DOMAINS_NAMESERVERS);
</script>

<Fieldset legend="Verification">
    <Layout.Stack gap="xl">
        <Layout.Stack gap="xl">
            <Layout.Stack gap="s">
                <Layout.Stack gap="s" direction="row" alignItems="center">
                    <Typography.Text variant="l-500">{domain.domain}</Typography.Text>

                    {#if verified === false}
                        <Badge variant="secondary" type="error" content="Verification failed" />
                    {/if}
                    <Badge variant="secondary" type="warning" content="Pending verification" />
                </Layout.Stack>
                <Typography.Text variant="m-400">
                    Add the following nameservers on your DNS provider. Note that DNS changes may
                    take time to propagate fully.
                </Typography.Text>
            </Layout.Stack>

            <Table.Root
                columns={[{ id: 'type' }, { id: 'value' }, { id: 'actions', width: 40 }]}
                let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
                    <Table.Header.Cell column="value" {root}>Value</Table.Header.Cell>
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>
                {#each nameservers as nameserver}
                    <Table.Row.Base {root}>
                        <Table.Cell column="type" {root}>NS</Table.Cell>
                        <Table.Cell column="value" {root}>{nameserver}</Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <Layout.Stack alignItems="flex-end">
                                <Copy value={nameserver}>
                                    <Icon icon={IconDuplicate} />
                                </Copy>
                            </Layout.Stack>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
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
        <Divider />
        <Layout.Stack direction="row" justifyContent="flex-end">
            <Button text on:click={back}>Back</Button>
            <Button secondary on:click={verifyStatus}>Verify</Button>
        </Layout.Stack>
    </Layout.Stack>
</Fieldset>
