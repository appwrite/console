<script lang="ts">
    import { EmptySearch, Id, PaginationWithLimit } from '$lib/components/index.js';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import Container from '$lib/layout/container.svelte';
    import { IconDotsHorizontal, IconInfo, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Badge,
        Card,
        Empty,
        Icon,
        Layout,
        Popover,
        Table,
        Tooltip
    } from '@appwrite.io/pink-svelte';
    import SearchQuery from '$lib/components/searchQuery.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import CertificateInfoModal from './certificateInfoModal.svelte';
    import DeleteCertificateModal from './deleteCertificateModal.svelte';

    export let data;

    let showDelete = false;
    let showAdvancedInfo = false;
    let selectedCertificate = null; //TODO: add type

    const now = new Date();
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery search={data.search} placeholder="Search by ID" />
    </Layout.Stack>

    {#if data.certificates.total}
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>ID</Table.Header.Cell>
                <Table.Header.Cell>Renewal</Table.Header.Cell>
                <Table.Header.Cell>Expiry date</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each data.certificates.certificates as certificate}
                {@const isExpired = new Date(certificate.expiresAt) < now}
                <Table.Row>
                    <Table.Cell>
                        <Id value={certificate.$id}>{certificate.$id}</Id>
                    </Table.Cell>
                    <Table.Cell>
                        {#if certificate?.renewAt && !isExpired}
                            <Layout.Stack direction="row" gap="xs">
                                {certificate.autoRenewal ? 'Auto' : ''}
                                <Badge
                                    size="xs"
                                    variant="secondary"
                                    content={`Next renewal in ${toLocaleDate(certificate.renewAt)}`}
                                    type="success" />
                            </Layout.Stack>
                        {:else}
                            -
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        {#if isExpired}
                            <Tooltip>
                                <Badge
                                    variant="secondary"
                                    content="Expired"
                                    type="warning"
                                    size="xs" />
                                <span slot="tooltip">
                                    {toLocaleDateTime(certificate?.expiresAt)}
                                </span>
                            </Tooltip>
                        {:else}
                            {toLocaleDate(certificate?.expiresAt)}
                        {/if}
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
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconInfo}
                                            on:click={(e) => {
                                                e.preventDefault();
                                                selectedCertificate = certificate;
                                                showAdvancedInfo = true;
                                                toggle(e);
                                            }}>
                                            Advanced information
                                        </ActionMenu.Item.Button>
                                        <ActionMenu.Item.Button
                                            status="danger"
                                            leadingIcon={IconTrash}
                                            on:click={(e) => {
                                                e.preventDefault();
                                                selectedCertificate = certificate;
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
            total={data.certificates.total} />
    {:else if data?.search}
        <EmptySearch hidePages bind:search={data.search} target="certificates">
            <svelte:fragment slot="actions">
                <Button
                    secondary
                    href={`${base}/organization-${$page.params.organization}/domains/domain-${$page.params.domain}/certificates`}>
                    Clear search
                </Button>
            </svelte:fragment>
        </EmptySearch>
    {:else}
        <Card.Base padding="none">
            <Empty
                type="secondary"
                title="No certificates found"
                description="You don't have any certificates yet.">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        href="#/"
                        text
                        event="empty_documentation"
                        size="s"
                        ariaLabel="add domain">Documentation</Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>

{#if showAdvancedInfo}
    <CertificateInfoModal {selectedCertificate} bind:show={showAdvancedInfo} />
{/if}
{#if showDelete}
    <DeleteCertificateModal {selectedCertificate} bind:show={showDelete} />
{/if}
