<script lang="ts">
    import { Container } from '$lib/layout';
    import {
        ActionMenu,
        Card,
        Empty,
        HiddenText,
        Icon,
        InlineCode,
        Layout,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DomainMetrics from './domainMetrics.svelte';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import { IconDotsHorizontal, IconPencil, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import { PaginationWithLimit } from '$lib/components';
    import { timeFromNow } from '$lib/helpers/date';

    export let data;

    let selectedRecord; //TODO: add type

    let showCreate = false;
    let showEdit = false;
    let showDelete = false;
</script>

<Container>
    <DomainMetrics domain={data.domain} />

    {#if data.records.total}
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Name</Table.Header.Cell>
                <Table.Header.Cell>Type</Table.Header.Cell>
                <Table.Header.Cell>Value</Table.Header.Cell>
                <Table.Header.Cell>TTL</Table.Header.Cell>
                <Table.Header.Cell>Created</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each data.records.records as record}
                <Table.Row>
                    <Table.Cell>
                        <Typography.Code>
                            {record.name}
                        </Typography.Code>
                    </Table.Cell>
                    <Table.Cell>
                        <Typography.Text>
                            {record.type}
                        </Typography.Text>
                    </Table.Cell>
                    <Table.Cell>
                        <HiddenText text={record.value} isVisible />
                    </Table.Cell>
                    <Table.Cell>
                        <Typography.Text>
                            {record.ttl}
                        </Typography.Text>
                    </Table.Cell>
                    <Table.Cell>
                        <Typography.Text>
                            {timeFromNow(record.$createdAt)}
                        </Typography.Text>
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
                                            leadingIcon={IconPencil}
                                            on:click={(e) => {
                                                e.preventDefault();
                                                selectedRecord = record;
                                                showEdit = true;
                                                toggle(e);
                                            }}>
                                            Edit
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
            total={data.records.total} />
    {:else}
        <Card.Base padding="none">
            <Empty
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/domains/empty-records-dark.svg`
                    : `${base}/images/domains/empty-records-light.svg`}
                title="Get started with Appwrite DNS">
                <span slot="description">
                    Navigate to your domain provider and update the nameservers to <InlineCode
                        code="ns1.appwrite-dns.com"
                        size="s" /> and <InlineCode code="ns2.appwrite-dns.com" size="s" />. Note
                    that DNS changes may take time to propagate fully.
                </span>
                <svelte:fragment slot="actions">
                    <Button
                        external
                        href="#"
                        text
                        event="empty_documentation"
                        size="s"
                        ariaLabel="add domain">Documentation</Button>

                    <Button secondary size="s">Verify DNS setup</Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
