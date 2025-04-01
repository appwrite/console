<script lang="ts">
    import {
        Badge,
        Divider,
        Fieldset,
        Icon,
        InteractiveText,
        Layout,
        Table,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Link } from '$lib/elements';
    import { consoleVariables } from '$routes/(console)/store';

    const backPage = `${base}/project-${page.params.project}/sites/site-${page.params.site}/domains`;

    let nameservers = $consoleVariables?._APP_DOMAINS_NAMESERVERS
        ? $consoleVariables?._APP_DOMAINS_NAMESERVERS.split(',')
        : ['ns1.appwrite.io', 'ns2.appwrite.io'];

    export let data;
    async function verifyStatus() {
        try {
            await sdk.forProject.proxy.updateRuleVerification(data.domain.$id);
            console.log(data.domain);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    let selectedTab: 'cname' | 'nameserver' = 'cname';

    $: isVerified = data.domain?.nameservers?.toLocaleLowerCase() === 'appwrite';
</script>

<Wizard title="Add custom domain" href={backPage} column columnSize="s" hideFooter>
    {#if isVerified}
        <Card radius="s">
            <Layout.Stack gap="s" direction="row" alignItems="center">
                <Typography.Text variant="l-500">{data.domain.domain}</Typography.Text>
                <Badge variant="secondary" type="success" content="Verified" />
            </Layout.Stack>
        </Card>
    {:else}
        <Fieldset legend="Verification">
            <Layout.Stack gap="xl">
                <div>
                    <Tabs.Root variant="secondary" let:root>
                        <Tabs.Item.Button
                            {root}
                            on:click={() => (selectedTab = 'cname')}
                            active={selectedTab === 'cname'}>
                            CNAME
                        </Tabs.Item.Button>
                        <Tabs.Item.Button
                            {root}
                            on:click={() => (selectedTab = 'nameserver')}
                            active={selectedTab === 'nameserver'}>
                            Nameservers
                        </Tabs.Item.Button>
                    </Tabs.Root>
                    <Divider />
                </div>
                {#if selectedTab === 'cname'}
                    <Layout.Stack gap="s">
                        <Layout.Stack gap="s" direction="row" alignItems="center">
                            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary"
                                >{data.domain?.domain}</Typography.Text>
                            {#if isVerified}
                                <Badge variant="secondary" type="success" content="Verified" />
                            {:else}
                                <Badge
                                    variant="secondary"
                                    type="warning"
                                    size="xs"
                                    content="Pending verification" />
                            {/if}
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Add the following record on your DNS provider. Note that DNS changes may
                            take time to propagate fully.
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
                            <Table.Cell {root}>{data.domain?.domain}</Table.Cell>
                            <Table.Cell {root}>
                                <InteractiveText
                                    variant="copy"
                                    isVisible
                                    text={globalThis?.location?.origin}>
                                    {globalThis?.location?.origin}</InteractiveText>
                            </Table.Cell>
                        </Table.Row.Base>
                    </Table.Root>
                    <Layout.Stack gap="s" direction="row" alignItems="center">
                        <Icon icon={IconInfo} size="s" color="--fgcolor-neutral-secondary" />
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                            A list of all domain providers and their DNS setting is available <Link
                                variant="muted"
                                external
                                href="https://appwrite.io/docs/advanced/platform/custom-domains"
                                >here</Link
                            >.
                        </Typography.Text>
                    </Layout.Stack>

                    <Divider />
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Button on:click={verifyStatus}>Verify</Button>
                    </Layout.Stack>
                {:else}
                    <Layout.Stack gap="s">
                        <Layout.Stack gap="s" direction="row" alignItems="center">
                            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary"
                                >{data.domain?.domain}</Typography.Text>
                            <Badge
                                variant="secondary"
                                type="warning"
                                size="xs"
                                content="Pending verification" />
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Add the following nameservers on your DNS provider. Note that DNS
                            changes may take time to propagate fully.
                        </Typography.Text>
                    </Layout.Stack>

                    <Table.Root columns={2} let:root>
                        <svelte:fragment slot="header" let:root>
                            <Table.Header.Cell {root}>Type</Table.Header.Cell>
                            <Table.Header.Cell {root}>Value</Table.Header.Cell>
                        </svelte:fragment>
                        {#each nameservers as nameserver}
                            <Table.Row.Base {root}>
                                <Table.Cell {root}>NS</Table.Cell>
                                <Table.Cell {root}>
                                    <InteractiveText variant="copy" isVisible text={nameserver}>
                                        {nameserver}</InteractiveText>
                                </Table.Cell>
                            </Table.Row.Base>
                        {/each}
                    </Table.Root>
                    <!-- <Layout.Stack gap="s" direction="row" alignItems="center">
                            <Icon icon={IconInfo} size="s" color="--fgcolor-neutral-secondary" />
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                                A list of all domain providers and their DNS setting is available <Link
                                    variant="muted"
                                    href="https://appwrite.io/docs/advanced/platform/custom-domains"
                                    >here</Link
                                >.
                            </Typography.Text>
                        </Layout.Stack> -->

                    <Divider />
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Button on:click={verifyStatus}>Verify</Button>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </Fieldset>
    {/if}
</Wizard>
