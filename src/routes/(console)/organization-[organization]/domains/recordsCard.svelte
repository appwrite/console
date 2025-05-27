<script lang="ts">
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import type { Domain } from '$lib/sdk/domains';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { consoleVariables } from '$routes/(console)/store';
    import {
        Badge,
        Layout,
        Typography,
        Table,
        Fieldset,
        Divider,
        Tabs,
        Input,
        InteractiveText
    } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';

    export let domain: Domain;

    let verified = undefined;

    const routeBase = `${base}/organization-${page.params.organization}/domains/domain-${domain.$id}`;

    // TODO: split _APP_DOMAINS_NAMESERVERS?
    const nameservers = $consoleVariables?._APP_DOMAINS_NAMESERVERS.split(',') ?? [
        'ns1.appwrite.io',
        'ns2.appwrite.io'
    ];

    async function verifyStatus() {
        try {
            domain = await sdk.forConsole.domains.updateNameservers(domain.$id);
            verified = domain.nameservers === 'Appwrite';
            if (verified) {
                addNotification({
                    type: 'success',
                    message: 'Domain verified'
                });

                await goto(routeBase);
            } else {
                addNotification({
                    type: 'error',
                    message: 'Domain not verified'
                });
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Fieldset legend="Verification">
    <Layout.Stack gap="xl">
        <div>
            <Tabs.Root variant="secondary" let:root>
                <Tabs.Item.Button {root} active>Nameservers</Tabs.Item.Button>
            </Tabs.Root>
            <Divider />
        </div>
        <Layout.Stack gap="s">
            <Layout.Stack gap="s" direction="row" alignItems="center">
                <Typography.Text variant="l-500" color="--fgcolor-neutral-primary"
                    >{domain.domain}</Typography.Text>

                {#if verified === false}
                    <Badge
                        variant="secondary"
                        type="error"
                        size="xs"
                        content="Verification failed" />
                {:else}
                    <Badge
                        variant="secondary"
                        type="warning"
                        size="xs"
                        content="Pending verification" />
                {/if}
            </Layout.Stack>
            <Typography.Text variant="m-400">
                Add the following nameservers on your DNS provider. Note that DNS changes may take
                time to propagate fully.
            </Typography.Text>
        </Layout.Stack>

        <Table.Root columns={[{ id: 'type' }, { id: 'value' }]} let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
                <Table.Header.Cell column="value" {root}>Value</Table.Header.Cell>
            </svelte:fragment>
            {#each nameservers as nameserver}
                <Table.Row.Base {root}>
                    <Table.Cell column="type" {root}>NS</Table.Cell>
                    <Table.Cell column="value" {root}>
                        <InteractiveText variant="copy-code" isVisible text={nameserver} />
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
        <Input.Helper state="default">
            A list of all domain providers and their DNS setting is available <Link
                variant="muted"
                external
                href="https://appwrite.io/docs/advanced/platform/custom-domains">here</Link
            >.
        </Input.Helper>
        <Divider />
        <Layout.Stack direction="row" justifyContent="flex-end">
            <Button on:click={verifyStatus}>Verify</Button>
        </Layout.Stack>
    </Layout.Stack>
</Fieldset>
