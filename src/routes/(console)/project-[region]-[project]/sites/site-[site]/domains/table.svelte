<script lang="ts">
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import {
        IconDotsHorizontal,
        IconRefresh,
        IconTrash,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Badge,
        Icon,
        Layout,
        Popover,
        Table,
        Typography,
        Divider
    } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import { ViewLogsModal } from '$lib/components';
    import { columns } from './store';
    import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';
    import { DnsRecordsAction } from '$lib/components';
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
    {#each proxyRules.rules as rule}
        <Table.Row.Base {root}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === 'domain'}
                        <Layout.Stack direction="row" gap="xs">
                            <Link
                                external
                                variant="quiet-muted"
                                href={`${$regionalProtocol}${rule.domain}`}>
                                <Typography.Text truncate>
                                    {rule.domain}
                                </Typography.Text>
                            </Link>

                            {#if rule.status === 'created'}
                                <Layout.Stack direction="row" gap="s" alignItems="center">
                                    <Badge
                                        variant="secondary"
                                        type="error"
                                        content="Verification failed"
                                        size="xs" />
                                    <Link
                                        size="s"
                                        variant="muted"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedProxyRule = rule;
                                            showRetry = true;
                                        }}>
                                        Retry
                                    </Link>
                                </Layout.Stack>
                            {:else if rule.status === 'verifying'}
                                <Layout.Stack direction="row" gap="s" alignItems="center">
                                    <Badge
                                        variant="secondary"
                                        content="Generating certificate"
                                        size="xs" />
                                    {#if rule.logs && rule.logs.length > 0}
                                        <Link
                                            size="s"
                                            variant="muted"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                selectedProxyRule = rule;
                                                showLogs = true;
                                            }}>
                                            View logs
                                        </Link>
                                    {/if}
                                </Layout.Stack>
                            {:else if rule.status === 'unverified'}
                                <Layout.Stack direction="row" gap="s" alignItems="center">
                                    <Badge
                                        variant="secondary"
                                        type="error"
                                        content="Certificate generation failed"
                                        size="xs" />
                                    {#if rule.logs && rule.logs.length > 0}
                                        <Link
                                            size="s"
                                            variant="muted"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                selectedProxyRule = rule;
                                                showLogs = true;
                                            }}>
                                            View logs
                                        </Link>
                                    {/if}
                                </Layout.Stack>
                            {/if}
                        </Layout.Stack>
                    {:else if column.id === 'target'}
                        {proxyTarget(rule)}
                    {:else if column.id === 'updated'}
                        <Layout.Stack direction="row" justifyContent="flex-end">
                            {#if rule.status !== 'verified'}
                                <Typography.Text
                                    variant="m-400"
                                    color="--fgcolor-neutral-tertiary"
                                    style="font-size: 0.875rem;">
                                    {#if rule.status === 'created'}
                                        Checked {timeFromNowShort(rule.$updatedAt)}
                                    {:else if rule.status === 'verifying'}
                                        Updated {timeFromNowShort(rule.$updatedAt)}
                                    {:else if rule.status === 'unverified'}
                                        Failed {timeFromNowShort(rule.$updatedAt)}
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
                                {#if rule.logs && rule.logs.length > 0}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTerminal}
                                        on:click={(e) => {
                                            selectedProxyRule = rule;
                                            showLogs = true;
                                            toggle(e);
                                        }}>
                                        View logs
                                    </ActionMenu.Item.Button>
                                {/if}
                                {#if rule.status !== 'verified' && rule.status !== 'verifying'}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconRefresh}
                                        on:click={(e) => {
                                            selectedProxyRule = rule;
                                            showRetry = true;
                                            toggle(e);
                                        }}>
                                        Retry
                                    </ActionMenu.Item.Button>
                                {/if}
                                <DnsRecordsAction {rule} {organizationDomains} />
                                {#if rule.logs && rule.logs.length > 0}
                                    <div class="action-menu-divider">
                                        <Divider />
                                    </div>
                                {/if}
                                <ActionMenu.Item.Button
                                    status="danger"
                                    leadingIcon={IconTrash}
                                    on:click={(e) => {
                                        selectedProxyRule = rule;
                                        showDelete = true;
                                        toggle(e);
                                        trackEvent(Click.DomainDeleteClick, {
                                            source: 'sites_domain_overview'
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
        padding-block-start: 0.25rem;
        padding-block-end: 0.25rem;
    }
</style>
