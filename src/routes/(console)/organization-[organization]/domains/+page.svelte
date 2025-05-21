<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { EmptySearch, PaginationWithLimit, ViewSelector } from '$lib/components/index.js';
    import { Button } from '$lib/elements/forms';
    import Link from '$lib/elements/link.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Container from '$lib/layout/container.svelte';
    import { protocol } from '$routes/(console)/store.js';
    import {
        IconDotsHorizontal,
        IconPlus,
        IconRefresh,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Card,
        Empty,
        Icon,
        Layout,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import { queries } from '$lib/components/filters';
    import SearchQuery from '$lib/components/searchQuery.svelte';
    import { app } from '$lib/stores/app';
    import type { Domain } from '$lib/sdk/domains';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';

    export let data;

    let showDelete = false;
    let showRetry = false;
    let selectedDomain: Domain = null;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery placeholder="Search domains" />
        <Layout.Stack direction="row" gap="m" inline>
            <ViewSelector view={View.Table} {columns} hideView />
            <Button
                on:click={() => {
                    trackEvent(Click.DomainCreateClick, {
                        source: 'organization_domain_overview'
                    });
                }}
                href={`${base}/organization-${page.params.organization}/domains/add-domain`}>
                <Icon icon={IconPlus} size="s" />
                Add domain
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if data.domains.total}
        <Table.Root let:root columns={[...$columns, { id: 'actions', width: 40 }]}>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title }}
                    <Table.Header.Cell column={id} {root}>
                        {title}
                    </Table.Header.Cell>
                {/each}
                <Table.Header.Cell {root} column="actions"></Table.Header.Cell>
            </svelte:fragment>
            {#each data.domains.domains as domain}
                <Table.Row.Link
                    {root}
                    href={`${base}/organization-${page.params.organization}/domains/domain-${domain.$id}`}>
                    {#each $columns as column}
                        <Table.Cell column={column.id} {root}>
                            <Typography.Text truncate>
                                {#if column.id === 'domain'}
                                    <Layout.Stack direction="row" gap="none">
                                        <Link
                                            external
                                            href={`${$protocol}${domain.domain}`}
                                            variant="quiet"
                                            icon>
                                            <Typography.Text truncate>
                                                {domain.domain}
                                            </Typography.Text>
                                        </Link>
                                    </Layout.Stack>
                                {:else if column.id === 'registrar'}
                                    {domain.registrar || '-'}
                                {:else if column.id === 'nameservers'}
                                    {domain.nameservers || '-'}
                                {:else if column.id === 'expiry_date'}
                                    {domain?.expiry ? toLocaleDateTime(domain.expiry) : '-'}
                                {:else if column.id === 'renewal'}
                                    {domain?.renewal ? toLocaleDateTime(domain.renewal) : '-'}
                                {:else if column.id === 'auto_renewal'}
                                    {domain?.autoRenewal ? 'On' : 'Off'}
                                {/if}
                            </Typography.Text>
                        </Table.Cell>
                    {/each}

                    <Table.Cell column="actions" {root}>
                        <Layout.Stack direction="row" justifyContent="flex-end">
                            <Popover let:toggle placement="bottom-end" padding="none">
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
                                        {#if domain.nameservers !== 'Appwrite'}
                                            <ActionMenu.Item.Button
                                                leadingIcon={IconRefresh}
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    selectedDomain = domain;
                                                    showRetry = true;
                                                    toggle(e);
                                                    trackEvent(
                                                        Click.DomainRetryDomainVerificationClick,
                                                        {
                                                            source: 'organization_domain_overview'
                                                        }
                                                    );
                                                }}>
                                                Retry
                                            </ActionMenu.Item.Button>
                                        {/if}
                                        <ActionMenu.Item.Button
                                            status="danger"
                                            leadingIcon={IconTrash}
                                            on:click={(e) => {
                                                e.preventDefault();
                                                selectedDomain = domain;
                                                showDelete = true;
                                                toggle(e);
                                                trackEvent(Click.DomainDeleteClick, {
                                                    source: 'organization_domain_overview'
                                                });
                                            }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Row.Link>
            {/each}
        </Table.Root>

        <PaginationWithLimit
            name="Domains"
            limit={data.limit}
            offset={data.offset}
            total={data.domains.total} />
    {:else if data?.query}
        <EmptySearch hidePages bind:search={data.search} target="domains">
            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        queries.clearAll();
                        queries.apply();
                    }}>Clear filters</Button>
            </svelte:fragment>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/domains/empty-domain-dark.svg`
                    : `${base}/images/domains/empty-domain-light.svg`}
                title="Add your first domain"
                description="Connect a domain you own to get your project up and running.">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        href="#/"
                        text
                        event="empty_documentation"
                        size="s"
                        ariaLabel="add domain">Documentation</Button>

                    <Button
                        secondary
                        on:click={() => {
                            trackEvent(Click.DomainCreateClick, {
                                source: 'organization_domain_overview'
                            });
                        }}
                        href={`${base}/organization-${page.params.organization}/domains/add-domain`}
                        size="s">
                        Add domain
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>

{#if showDelete}
    <DeleteDomainModal bind:show={showDelete} {selectedDomain} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} {selectedDomain} />
{/if}
