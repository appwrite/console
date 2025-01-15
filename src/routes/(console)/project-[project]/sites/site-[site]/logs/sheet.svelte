<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import type { Models } from '@appwrite.io/console';
    import { IconChevronDown } from '@appwrite.io/pink-icons-svelte';

    import {
        Accordion,
        Badge,
        Icon,
        Layout,
        Sheet,
        Table,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';

    export let openSheet = false;
    export let selectedLog: Models.Execution = null;

    $: console.log(selectedLog);
</script>

<Sheet bind:open={openSheet}>
    <div slot="header" style:width="100%">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Layout.Stack direction="row" gap="m" alignItems="center">
                <Typography.Text variant="m-400">Log ID</Typography.Text>
                <Tag size="s">{selectedLog.$id}</Tag>
            </Layout.Stack>

            <Button icon text size="s">
                <Icon icon={IconChevronDown}></Icon>
            </Button>
        </Layout.Stack>
    </div>
    <Layout.Stack gap="xl">
        <Accordion title="Details" open>
            <Layout.Stack direction="row" gap="xl">
                <Layout.Stack gap="xs" inline>
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Method
                    </Typography.Text>
                    <Typography.Text variant="m-400">{selectedLog.requestMethod}</Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xs" inline>
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Status code
                    </Typography.Text>
                    <span>
                        <Badge
                            content={selectedLog.responseStatusCode.toString()}
                            variant="secondary"
                            type={selectedLog?.responseStatusCode >= 400 ? 'error' : 'success'} />
                    </span>
                </Layout.Stack>
                <Layout.Stack gap="xs" inline>
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Duration
                    </Typography.Text>
                    <Typography.Text variant="m-400">{selectedLog.duration}</Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </Accordion>
        <Accordion title="Request" open>
            {#if selectedLog.requestHeaders?.length}
                <Table.Root>
                    <svelte:fragment slot="header">
                        <Table.Header.Cell>Key</Table.Header.Cell>
                        <Table.Header.Cell>Value</Table.Header.Cell>
                    </svelte:fragment>
                    {#each selectedLog.requestHeaders as request}
                        <Table.Row>
                            <Table.Cell>{request.name}</Table.Cell>
                            <Table.Cell>{request.value}</Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Root>
            {/if}
        </Accordion>
        <Accordion title="Response" open>Logs</Accordion>
    </Layout.Stack>
</Sheet>
