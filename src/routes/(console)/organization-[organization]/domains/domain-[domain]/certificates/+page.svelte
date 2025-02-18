<script lang="ts">
    import { EmptySearch, Id, PaginationWithLimit } from '$lib/components/index.js';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Container from '$lib/layout/container.svelte';
    import { IconDotsHorizontal, IconInfo, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Card,
        Empty,
        Icon,
        Layout,
        Popover,
        Table
    } from '@appwrite.io/pink-svelte';
    import SearchQuery from '$lib/components/searchQuery.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import CertificateInfoModal from './certificateInfoModal.svelte';

    export let data;

    let showDelete = false;
    let showAdvancedInfo = false;
    let selectedCertificate = null; //TODO: add type
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery search={data.search} placeholder="Search domains" />
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
                <Table.Row>
                    <Table.Cell>
                        <Id value={certificate.$id}>{certificate.$id}</Id>
                    </Table.Cell>
                    <Table.Cell>
                        {certificate.autoRenewal ? 'Auto' : ''}
                        {certificate.renewAt ? toLocaleDateTime(certificate.renewAt) : '-'}
                    </Table.Cell>
                    <Table.Cell>{certificate?.expiresAt ?? '-'}</Table.Cell>

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
    <CertificateInfoModal {selectedCertificate} show={showAdvancedInfo} />
{/if}
