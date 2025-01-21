<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { PaginationWithLimit } from '$lib/components/index.js';
    import { Button, InputSearch } from '$lib/elements/forms';
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
    import { ActionMenu, Icon, Layout, Popover, Table } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';

    export let data;

    let search = '';
    let showDelete = false;
    let showRetry = false;
    let selectedDomain: Models.ProxyRule = null;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <div>
            <InputSearch placeholder="Search domains" bind:value={search} />
        </div>
        <Button
            href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains/add-domain`}>
            <Icon icon={IconPlus} size="s" />
            Add domain
        </Button>
    </Layout.Stack>
    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Domain</Table.Header.Cell>
            <Table.Header.Cell>Updated</Table.Header.Cell>
            <Table.Header.Cell />
        </svelte:fragment>
        {#each data.domains.rules as domain}
            <Table.Row>
                <Table.Cell>
                    <Link external href={`${$protocol}${domain.domain}`} size="s" variant="quiet">
                        {domain.domain}
                        <Icon icon={IconExternalLink} size="s" />
                    </Link>
                </Table.Cell>
                <Table.Cell>{toLocaleDateTime(domain.$updatedAt)}</Table.Cell>
                <Table.Cell>
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Popover let:toggle placement="bottom-start" padding="none">
                            <Button text icon on:click={toggle}>
                                <Icon icon={IconDotsHorizontal} size="s" />
                            </Button>

                            <svelte:fragment slot="tooltip" let:toggle>
                                <ActionMenu.Root>
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
            </Table.Row>
        {/each}
    </Table.Root>

    <PaginationWithLimit
        name="Domains"
        limit={data.limit}
        offset={data.offset}
        total={data.domains.total} />
</Container>

{#if showDelete}
    <DeleteDomainModal show={showDelete} {selectedDomain} />
{/if}

{#if showRetry}
    <RetryDomainModal show={showRetry} {selectedDomain} />
{/if}
