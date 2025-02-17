<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { EmptySearch, PaginationWithLimit } from '$lib/components/index.js';
    import { Button } from '$lib/elements/forms';
    import Link from '$lib/elements/link.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
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
        Badge,
        Card,
        Empty,
        Icon,
        Layout,
        Popover,
        Table
    } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import { queries } from '$lib/components/filters';
    import SearchQuery from '$lib/components/searchQuery.svelte';
    import { app } from '$lib/stores/app';

    export let data;

    let showDelete = false;
    let showRetry = false;
    let selectedDomain: Models.ProxyRule = null;

    $: console.log(data.domains);

    // TODO: replace status once backend is fixed
    // created - Verification Failed
    // verified - Verification OK , Certificate OK
    // verifying - Verifiacitok OK
    // unverified - Verificaiton OK , Certificate Failed
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery search={data.search} placeholder="Search domains" />
        <Button href={`${base}/organization-${$page.params.organization}/domains/add-domain`}>
            <Icon icon={IconPlus} size="s" />
            Add domain
        </Button>
    </Layout.Stack>

    {#if data.domains.total}
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Domain</Table.Header.Cell>
                <Table.Header.Cell>Registrar</Table.Header.Cell>
                <Table.Header.Cell>Nameservers</Table.Header.Cell>
                <Table.Header.Cell>Expiry date</Table.Header.Cell>
                <Table.Header.Cell>Renewal</Table.Header.Cell>
                <Table.Header.Cell>Auto renewal</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each data.domains.rules as domain}
                <Table.Link
                    href={`${base}/organization-${$page.params.organization}/domains/domain-${domain.$id}`}>
                    <Table.Cell>
                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                            <Link
                                external
                                href={`${$protocol}${domain.domain}`}
                                size="s"
                                variant="quiet">
                                <Layout.Stack direction="row" alignItems="center" gap="xs">
                                    {domain.domain}
                                    <Icon icon={IconExternalLink} size="s" />
                                </Layout.Stack>
                            </Link>
                            {#if domain.status === 'created'}
                                <Badge
                                    variant="secondary"
                                    content="Verification failed"
                                    type="error" />
                            {:else if domain.status === 'veryfing'}
                                <Badge
                                    variant="secondary"
                                    content="Pending verification"
                                    type="warning" />
                            {/if}
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell>{domain?.registrar ?? 'N/A'}</Table.Cell>
                    <Table.Cell>{domain?.nameservers ?? 'N/A'}</Table.Cell>
                    <Table.Cell>{domain?.expiry ?? 'N/A'}</Table.Cell>
                    <Table.Cell>
                        {domain.renewAt ? toLocaleDateTime(domain.renewAt) : 'N/A'}
                    </Table.Cell>
                    <Table.Cell>{domain.autoRenewal ? 'On' : 'Off'}</Table.Cell>
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
                                            }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Link>
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
                        href={`${base}/organization-${$page.params.organization}/domains/add-domain`}
                        size="s">
                        Add domain
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>

{#if showDelete}
    <DeleteDomainModal show={showDelete} {selectedDomain} />
{/if}

{#if showRetry}
    <RetryDomainModal show={showRetry} {selectedDomain} />
{/if}
