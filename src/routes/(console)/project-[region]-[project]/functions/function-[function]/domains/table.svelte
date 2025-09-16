<script lang="ts">
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import {
        IconDotsHorizontal,
        IconRefresh,
        IconTerminal,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Badge,
        Divider,
        Icon,
        Layout,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import { ViewLogsModal } from '$lib/components';
    import { columns } from './store';
    import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';
    import DnsRecordsAction from '$lib/components/domains/dnsRecordsAction.svelte';
    import { timeFromNowShort } from '$lib/helpers/date';

    let {
        proxyRules,
        organizationDomains
    }: {
        proxyRules: Models.ProxyRuleList;
        organizationDomains?: Models.DomainsList;
    } = $props();

    let showDelete = $state(false);
    let showRetry = $state(false);
    let showLogs = $state(false);
    let selectedProxyRule: Models.ProxyRule = $state(null);

    const proxyTarget = (proxy: Models.ProxyRule) => {
        return proxy?.redirectUrl
            ? 'Redirect to ' + proxy.redirectUrl
            : proxy?.deploymentVcsProviderBranch
              ? 'Deployed from ' + proxy.deploymentVcsProviderBranch
              : 'Active deployment';
    };
</script>

<Table.Root columns={[...$columns, { id: 'actions', width: 40 }]} let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>
                {title}
            </Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#each proxyRules.rules as proxyRule}
        <Table.Row.Base {root}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === 'domain'}
                        <Layout.Stack direction="row" gap="xs">
                            <Link
                                external
                                variant="quiet"
                                href={`${$regionalProtocol}${proxyRule.domain}`}>
                                <Typography.Text truncate>
                                    {proxyRule.domain}
                                </Typography.Text>
                            </Link>
                            {#if proxyRule.status === 'created'}
                                <Layout.Stack direction="row" gap="xs" alignItems="center">
                                    <Badge
                                        variant="secondary"
                                        type="error"
                                        content="Verification failed"
                                        size="xs" />
                                    <Link
                                        size="s"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedProxyRule = proxyRule;
                                            showRetry = true;
                                        }}>
                                        Retry
                                    </Link>
                                </Layout.Stack>
                            {:else if proxyRule.status === 'verifying'}
                                <Layout.Stack direction="row" gap="xs" alignItems="center">
                                    <Badge
                                        variant="secondary"
                                        content="Generating certificate"
                                        size="xs" />
                                    <Link
                                        size="s"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedProxyRule = proxyRule;
                                            showLogs = true;
                                        }}>
                                        View logs
                                    </Link>
                                </Layout.Stack>
                            {:else if proxyRule.status === 'unverified'}
                                <Layout.Stack direction="row" gap="xs" alignItems="center">
                                    <Badge
                                        variant="secondary"
                                        type="error"
                                        content="Certificate generation failed"
                                        size="xs" />
                                    <Link
                                        size="s"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedProxyRule = proxyRule;
                                            showLogs = true;
                                        }}>
                                        View logs
                                    </Link>
                                </Layout.Stack>
                            {/if}
                        </Layout.Stack>
                    {:else if column.id === 'target'}
                        {proxyTarget(proxyRule)}
                    {:else if column.id === 'updated'}
                        <Layout.Stack direction="row" justifyContent="flex-end">
                            {#if proxyRule.status !== 'verified'}
                                <Typography.Text
                                    variant="m-400"
                                    color="--fgcolor-neutral-tertiary"
                                    style="font-size: 0.875rem;">
                                    {#if proxyRule.status === 'created'}
                                        Checked {timeFromNowShort(proxyRule.$updatedAt)}
                                    {:else if proxyRule.status === 'verifying'}
                                        Updated {timeFromNowShort(proxyRule.$updatedAt)}
                                    {:else if proxyRule.status === 'unverified'}
                                        Failed {timeFromNowShort(proxyRule.$updatedAt)}
                                    {/if}
                                </Typography.Text>
                            {/if}
                        </Layout.Stack>
                    {/if}
                </Table.Cell>
            {/each}
            <Table.Cell column="actions" {root}>
                <Layout.Stack direction="row" justifyContent="flex-end">
                    <Popover let:toggle placement="bottom-start" padding="none">
                        <Button
                            text
                            icon
                            on:click={(e) => {
                                e.preventDefault();
                                toggle(e);
                            }}>
                            <Icon icon={IconDotsHorizontal} size="s" />
                        </Button>

                        <svelte:fragment slot="tooltip" let:toggle>
                            <ActionMenu.Root>
                                {#if proxyRule.logs && (proxyRule.status === 'unverified' || proxyRule.status === 'verifying')}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTerminal}
                                        on:click={(e) => {
                                            selectedProxyRule = proxyRule;
                                            showLogs = true;
                                            toggle(e);
                                        }}>
                                        View logs
                                    </ActionMenu.Item.Button>
                                {/if}
                                {#if proxyRule.status !== 'verified' && proxyRule.status !== 'verifying'}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconRefresh}
                                        on:click={(e) => {
                                            selectedProxyRule = proxyRule;
                                            showRetry = true;
                                            toggle(e);
                                        }}>
                                        Retry
                                    </ActionMenu.Item.Button>
                                {/if}
                                <DnsRecordsAction rule={proxyRule} {organizationDomains} />
                                {#if proxyRule.logs && (proxyRule.status === 'unverified' || proxyRule.status === 'verifying')}
                                    <div class="action-menu-divider">
                                        <Divider />
                                    </div>
                                {/if}
                                <ActionMenu.Item.Button
                                    status="danger"
                                    leadingIcon={IconTrash}
                                    on:click={(e) => {
                                        selectedProxyRule = proxyRule;
                                        showDelete = true;
                                        toggle(e);
                                        trackEvent(Click.DomainDeleteClick, {
                                            source: 'functions_domain_overview'
                                        });
                                    }}>
                                    Delete
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </svelte:fragment>
                    </Popover>
                </Layout.Stack>
            </Table.Cell>
        </Table.Row.Base>
    {/each}
</Table.Root>

{#if showDelete}
    <DeleteDomainModal bind:show={showDelete} {selectedProxyRule} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} {selectedProxyRule} />
{/if}

{#if showLogs}
    <ViewLogsModal bind:show={showLogs} {selectedProxyRule} />
{/if}

<style>
    .action-menu-divider {
        margin-inline: -1rem;
    }
</style>
