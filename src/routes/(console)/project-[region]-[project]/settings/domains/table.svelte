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
    import { regionalProtocol } from '../../store';
    import DnsRecordsAction from '$lib/components/domains/dnsRecordsAction.svelte';
    import { timeFromNowShort } from '$lib/helpers/date';

    let {
        domains,
        organizationDomains
    }: {
        domains: Models.ProxyRuleList;
        organizationDomains?: Models.DomainsList;
    } = $props();

    let showDelete = $state(false);
    let showRetry = $state(false);
    let showLogs = $state(false);
    let selectedDomain: Models.ProxyRule = $state(null);

    const columns = [
        {
            id: 'domain',
            title: 'Domain',
            type: 'string',
            format: 'string',
            width: { min: 300, max: 550 }
        },
        {
            id: 'updated',
            title: '',
            type: 'string',
            width: { min: 160, max: 180 }
        }
    ];
</script>

<Table.Root columns={[...columns, { id: 'actions', width: 40 }]} let:root>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>
                {title}
            </Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#each domains.rules as domain}
        <Table.Row.Base {root}>
            {#each columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === 'domain'}
                        <Layout.Stack direction="row" gap="xs">
                            <Link
                                external
                                variant="quiet"
                                href={`${$regionalProtocol}${domain.domain}`}>
                                <Typography.Text truncate>
                                    {domain.domain}
                                </Typography.Text>
                            </Link>
                            {#if domain.status === 'created'}
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
                                            selectedDomain = domain;
                                            showRetry = true;
                                        }}>
                                        Retry
                                    </Link>
                                </Layout.Stack>
                            {:else if domain.status === 'verifying'}
                                <Layout.Stack direction="row" gap="xs" alignItems="center">
                                    <Badge
                                        variant="secondary"
                                        content="Generating certificate"
                                        size="xs" />
                                    <Link
                                        size="s"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedDomain = domain;
                                            showLogs = true;
                                        }}>
                                        View logs
                                    </Link>
                                </Layout.Stack>
                            {:else if domain.status === 'unverified'}
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
                                            selectedDomain = domain;
                                            showLogs = true;
                                        }}>
                                        View logs
                                    </Link>
                                </Layout.Stack>
                            {/if}
                        </Layout.Stack>
                    {:else if column.id === 'updated'}
                        <Layout.Stack direction="row" justifyContent="flex-end">
                            {#if domain.status !== 'verified'}
                                <Typography.Text
                                    variant="m-400"
                                    color="--fgcolor-neutral-tertiary"
                                    style="font-size: 0.875rem;">
                                    {#if domain.status === 'created'}
                                        Checked {timeFromNowShort(domain.$updatedAt)}
                                    {:else if domain.status === 'verifying'}
                                        Updated {timeFromNowShort(domain.$updatedAt)}
                                    {:else if domain.status === 'unverified'}
                                        Failed {timeFromNowShort(domain.$updatedAt)}
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
                                {#if domain.logs && (domain.status === 'unverified' || domain.status === 'verifying')}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTerminal}
                                        on:click={(e) => {
                                            selectedDomain = domain;
                                            showLogs = true;
                                            toggle(e);
                                        }}>
                                        View logs
                                    </ActionMenu.Item.Button>
                                {/if}
                                {#if domain.status !== 'verified' && domain.status !== 'verifying'}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconRefresh}
                                        on:click={(e) => {
                                            selectedDomain = domain;
                                            showRetry = true;
                                            toggle(e);
                                        }}>
                                        Retry
                                    </ActionMenu.Item.Button>
                                {/if}
                                <DnsRecordsAction rule={domain} {organizationDomains} />
                                {#if domain.logs && (domain.status === 'unverified' || domain.status === 'verifying')}
                                    <div class="action-menu-divider">
                                        <Divider />
                                    </div>
                                {/if}
                                <ActionMenu.Item.Button
                                    status="danger"
                                    leadingIcon={IconTrash}
                                    on:click={(e) => {
                                        selectedDomain = domain;
                                        showDelete = true;
                                        toggle(e);
                                        trackEvent(Click.DomainDeleteClick, {
                                            source: 'settings_domain_overview'
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
    <DeleteDomainModal bind:show={showDelete} {selectedDomain} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} {selectedDomain} />
{/if}

{#if showLogs}
    <ViewLogsModal bind:show={showLogs} selectedProxyRule={selectedDomain} />
{/if}

<style>
    .action-menu-divider {
        margin-inline: -1rem;
    }
</style>
