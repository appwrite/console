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
        Typography,
        Tooltip
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconLockClosed,
        IconPencil,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { columns } from './store';
    import DeleteRecordModal from './deleteRecordModal.svelte';
    import EditRecordModal from './updateRecordModal.svelte';
    import type { DnsRecord } from '$lib/sdk/domains';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let showEdit = false;
    let showDelete = false;
    let selectedRecord: DnsRecord = null;
</script>

<Layout.Stack>
    <Table.Root columns={[...$columns, { id: 'actions', width: 40 }]} let:root>
        <svelte:fragment slot="header" let:root>
            {#each $columns as { id, title } (id)}
                <Table.Header.Cell column={id} {root}>
                    {title}
                </Table.Header.Cell>
            {/each}
            <Table.Header.Cell column="actions" {root} />
        </svelte:fragment>

        {#each data.recordList.dnsRecords as record}
            <Table.Row.Base {root}>
                {#each $columns as column}
                    <Table.Cell column={column.id} {root}>
                        {#if column.id === 'name'}
                            <Typography.Code>
                                {record.name}
                            </Typography.Code>
                        {:else if column.id === 'type'}
                            <Typography.Text>
                                {record.type}
                            </Typography.Text>
                        {:else if column.id === 'value'}
                            <InteractiveText variant="copy" text={record.value} isVisible />
                        {:else if column.id === 'ttl'}
                            <Typography.Text>
                                {record.ttl}
                            </Typography.Text>
                        {:else if column.id === 'priority'}
                            <Typography.Text>
                                {record?.priority ?? '-'}
                            </Typography.Text>
                        {:else if column.id === 'comment'}
                            <Typography.Text>
                                {record?.comment ?? '-'}
                            </Typography.Text>
                        {:else if column.id === '$createdAt'}
                            <DualTimeView time={record.$createdAt} />
                        {/if}
                    </Table.Cell>
                {/each}
                <Table.Cell column="actions" {root}>
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        {#if record.lock}
                            <Tooltip>
                                <Icon icon={IconLockClosed} size="s" />
                                <span slot="tooltip">DNS record is locked</span>
                            </Tooltip>
                        {:else}
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
                        {/if}
                    </Layout.Stack>
                </Table.Cell>
            </Table.Row.Base>
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
