<script lang="ts">
    import { PaginationWithLimit } from '$lib/components';
    import {
        ActionMenu,
        Button,
        InteractiveText,
        Icon,
        Layout,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconDotsHorizontal, IconPencil, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import { columns } from './store';
    import DeleteRecordModal from './deleteRecordModal.svelte';
    import EditRecordModal from './updateRecordModal.svelte';
    import type { DnsRecord } from '$lib/sdk/domains';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let data;

    let showEdit = false;
    let showDelete = false;
    let selectedRecord: DnsRecord = null;
</script>

<Layout.Stack>
    <Table.Root>
        <svelte:fragment slot="header">
            {#each $columns as column}
                {#if column.show}
                    <Table.Header.Cell width={column?.width?.toString() ?? ''}>
                        {column.title}
                    </Table.Header.Cell>
                {/if}
            {/each}
            <Table.Header.Cell width="40" />
        </svelte:fragment>

        {#each data.recordList.dnsRecords as record}
            <Table.Row>
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === 'name'}
                            <Table.Cell>
                                <Typography.Code>
                                    {record.name}
                                </Typography.Code>
                            </Table.Cell>
                        {:else if column.id === 'type'}
                            <Table.Cell>
                                <Typography.Text>
                                    {record.type}
                                </Typography.Text>
                            </Table.Cell>
                        {:else if column.id === 'value'}
                            <Table.Cell>
                                <InteractiveText variant="copy" text={record.value} isVisible />
                            </Table.Cell>
                        {:else if column.id === 'ttl'}
                            <Table.Cell>
                                <Typography.Text>
                                    {record.ttl}
                                </Typography.Text>
                            </Table.Cell>
                        {:else if column.id === 'priority'}
                            <Table.Cell>
                                <Typography.Text>
                                    {record?.priority ?? '-'}
                                </Typography.Text>
                            </Table.Cell>
                        {:else if column.id === 'comment'}
                            <Table.Cell>
                                <Typography.Text>
                                    {record?.comment ?? '-'}
                                </Typography.Text>
                            </Table.Cell>
                        {:else if column.id === '$createdAt'}
                            <Table.Cell>
                                <DualTimeView time={record.$createdAt} />
                            </Table.Cell>
                        {/if}
                    {/if}
                {/each}
                <Table.Cell>
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Popover let:toggle placement="bottom-start" padding="none">
                            <Button.Button
                                variant="text"
                                icon
                                size="s"
                                on:click={(e) => {
                                    e.preventDefault();
                                    toggle(e);
                                }}>
                                <Icon icon={IconDotsHorizontal} size="s" />
                            </Button.Button>

                            <svelte:fragment slot="tooltip" let:toggle>
                                <ActionMenu.Root>
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconPencil}
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedRecord = record;
                                            showEdit = true;
                                            toggle(e);
                                        }}>
                                        Update
                                    </ActionMenu.Item.Button>
                                    <ActionMenu.Item.Button
                                        status="danger"
                                        leadingIcon={IconTrash}
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedRecord = record;
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
        total={data.recordList.total} />
</Layout.Stack>

{#if showDelete}
    <DeleteRecordModal bind:show={showDelete} {selectedRecord} />
{/if}
{#if showEdit}
    <EditRecordModal bind:show={showEdit} {selectedRecord} />
{/if}
