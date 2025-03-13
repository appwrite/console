<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { EmptySearch, PaginationWithLimit } from '$lib/components/index.js';
    import { Button } from '$lib/elements/forms';
    import Link from '$lib/elements/link.svelte';
    import Container from '$lib/layout/container.svelte';
    import { protocol } from '$routes/(console)/store.js';
    import type { Models } from '@appwrite.io/console';
    import {
        IconDotsHorizontal,
        IconExternalLink,
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
        Table
    } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import SearchQuery from '$lib/components/searchQuery.svelte';
    import { app } from '$lib/stores/app';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import CreatePreviewDomainModal from './createPreviewDomainModal.svelte';

    export let data;

    let showDelete = false;
    let showRetry = false;
    let selectedDomain: Models.ProxyRule = null;
    let showPreviewDomainModal = false;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery search={data.search} placeholder="Search domain" />
        <Popover padding="none" let:toggle placement="bottom-end">
            <Button
                on:click={(event) => {
                    toggle(event);
                    trackEvent(Click.DomainCreateClick, {
                        source: 'functions_domain_overview'
                    });
                }}>
                <Icon icon={IconPlus} size="s" />
                Add domain
            </Button>
            <svelte:fragment slot="tooltip">
                <ActionMenu.Root>
                    <ActionMenu.Item.Anchor
                        href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/domains/add-domain`}>
                        Custom domain
                    </ActionMenu.Item.Anchor>
                    <ActionMenu.Item.Button on:click={() => (showPreviewDomainModal = true)}>
                        Preview domain
                    </ActionMenu.Item.Button>
                </ActionMenu.Root>
            </svelte:fragment>
        </Popover>
    </Layout.Stack>

    {#if data.domains.total}
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell width="200px">Domain</Table.Header.Cell>
                <Table.Header.Cell>Redirect to</Table.Header.Cell>
                <Table.Header.Cell>Production branch</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each data.domains.rules as domain}
                <Table.Row>
                    <Table.Cell>
                        <Link external href={`${$protocol}${domain.domain}`} variant="quiet">
                            <Layout.Stack direction="row" alignItems="center" gap="xs">
                                {domain.domain}
                                <Icon icon={IconExternalLink} size="s" />
                            </Layout.Stack>
                        </Link>
                    </Table.Cell>
                    <Table.Cell>
                        {domain?.redirectUrl || 'No redirect'}
                        {domain?.redirectStatusCode ? `(${domain.redirectStatusCode})` : ''}
                    </Table.Cell>
                    <Table.Cell>
                        {domain.deploymentVcsProviderBranch || '-'}
                    </Table.Cell>
                    <Table.Cell>
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
                                        {#if domain.status !== 'verified'}
                                            <ActionMenu.Item.Button
                                                leadingIcon={IconRefresh}
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    selectedDomain = domain;
                                                    showRetry = true;
                                                    toggle(e);
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
                </Table.Row>
            {/each}
        </Table.Root>

        <PaginationWithLimit
            name="Domains"
            limit={data.limit}
            offset={data.offset}
            total={data.domains.total} />
    {:else if data?.search}
        <EmptySearch hidePages bind:search={data.search} target="domains" hidePagination>
            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        data.search = '';
                    }}>Clear search</Button>
            </svelte:fragment>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/domains/empty-domain-dark.svg`
                    : `${base}/images/domains/empty-domain-light.svg`}
                title="Use a custom domain for your function"
                description="Make your function easier to access and integrate by assigning it a custom domain.">
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
                        href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/domains/add-domain`}
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

{#if showPreviewDomainModal}
    <CreatePreviewDomainModal bind:show={showPreviewDomainModal} />
{/if}
