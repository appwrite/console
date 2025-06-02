<script lang="ts" context="module">
    import type { RecordType } from '$lib/stores/domains';

    export function showPriority(record: Models.DnsRecord | RecordType): boolean {
        const type = typeof record === 'string' ? record : record.type;
        return type.toLowerCase() === 'mx' || type.toLowerCase() === 'srv';
    }
</script>

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
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import type { PageData } from './$types';
    import type { Models } from '@appwrite.io/console';

    export let data: PageData;

    let showEdit = false;
    let showDelete = false;
    let selectedRecord: Models.DnsRecord = null;

    function formatRecordName(name: string) {
        const limit = 30;
        return {
            value: name.length > limit ? `${name.slice(0, limit)}...` : name,
            truncated: name.length > limit,
            whole: name
        };
    }
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
                            {@const formatted = formatRecordName(record.name)}
                            <Tooltip placement="bottom" disabled={!formatted.truncated}>
                                <Typography.Text truncate>{formatted.value}</Typography.Text>
                                <span
                                    slot="tooltip"
                                    style:white-space="pre-wrap"
                                    style:word-break="break-all">
                                    {formatted.whole}
                                </span>
                            </Tooltip>
                        {:else if column.id === 'type'}
                            <Typography.Text>
                                {record.type}
                            </Typography.Text>
                        {:else if column.id === 'value'}
                            {@const isARecord = record.value === 'a.a.a.a'}
                            {#if isARecord}
                                <!-- to align with InteractiveText -->
                                <div style:padding-inline-start="4px">
                                    <Typography.Text>Served by Appwrite</Typography.Text>
                                </div>
                            {:else}
                                <InteractiveText variant="copy" text={record.value} isVisible />
                            {/if}
                        {:else if column.id === 'ttl'}
                            <Typography.Text>
                                {record.ttl}
                            </Typography.Text>
                        {:else if column.id === 'priority'}
                            <Typography.Text>
                                {showPriority(record) ? record?.priority || '-' : '-'}
                            </Typography.Text>
                        {:else if column.id === 'comment'}
                            <Typography.Text truncate>
                                {record?.comment ?? '-'}
                            </Typography.Text>
                        {:else if column.id === '$createdAt'}
                            <DualTimeView time={record.$createdAt} />
                        {/if}
                    </Table.Cell>
                {/each}
                <Table.Cell column="actions" {root}>
                    <Layout.Stack direction="row" justifyContent="center">
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
