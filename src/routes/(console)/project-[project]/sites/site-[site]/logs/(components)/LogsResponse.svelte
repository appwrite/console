<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Logs, Table, Tabs, Typography } from '@appwrite.io/pink-svelte';

    export let selectedLog: Models.Execution;

    let responseTab: 'logs' | 'errors' | 'headers' | 'body' = 'logs';
</script>

<Layout.Stack>
    <Tabs.Root variant="secondary" let:root>
        <Tabs.Item.Button
            {root}
            active={responseTab === 'logs'}
            on:click={() => (responseTab = 'logs')}>
            Logs
        </Tabs.Item.Button>
        <Tabs.Item.Button
            {root}
            active={responseTab === 'errors'}
            on:click={() => (responseTab = 'errors')}>
            Errors
        </Tabs.Item.Button>
        <Tabs.Item.Button
            {root}
            active={responseTab === 'headers'}
            on:click={() => (responseTab = 'headers')}>
            Headers <Badge
                variant="secondary"
                size="s"
                content={selectedLog?.responseHeaders?.length?.toString()} />
        </Tabs.Item.Button>
        <Tabs.Item.Button
            {root}
            active={responseTab === 'body'}
            on:click={() => (responseTab = 'body')}>
            Body
        </Tabs.Item.Button>
    </Tabs.Root>
    {#if responseTab === 'logs'}
        {#if selectedLog.logs}
            <Logs logs={selectedLog.logs} />
        {:else}
            <Typography.Code>No logs found.</Typography.Code>
        {/if}
    {:else if responseTab === 'errors'}
        {#if selectedLog.errors}
            <Logs logs={selectedLog.errors} />
        {:else}
            <Typography.Code>No errors found.</Typography.Code>
        {/if}
    {:else if responseTab === 'headers'}
        {#if selectedLog.responseHeaders?.length}
            <Table.Root>
                <svelte:fragment slot="header">
                    <Table.Header.Cell>Key</Table.Header.Cell>
                    <Table.Header.Cell>Value</Table.Header.Cell>
                </svelte:fragment>
                {#each selectedLog.responseHeaders as request}
                    <Table.Row>
                        <Table.Cell>{request.name}</Table.Cell>
                        <Table.Cell>{request.value}</Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Root>
            <p>
                <Layout.Stack direction="row" gap="xs" alignItems="center">
                    <Icon icon={IconInfo} size="s" color="--color-fgcolor-neutral-secondary" /> Missing
                    headers? Check our docs to see the supported data and how to log it.
                </Layout.Stack>
            </p>
        {:else}
            <Typography.Code>No headers found.</Typography.Code>
        {/if}
    {:else if responseTab === 'body'}
        {#if selectedLog.responseBody}
            <Logs logs={selectedLog.responseBody} />
        {:else}
            <Typography.Code>No parameters found.</Typography.Code>
        {/if}
    {/if}
</Layout.Stack>
