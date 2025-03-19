<script lang="ts">
    import { Card } from '$lib/components';
    import { Link } from '$lib/elements';
    import type { Models } from '@appwrite.io/console';
    import {
        Badge,
        Divider,
        Input,
        Layout,
        Logs,
        Table,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let selectedLog: Models.Execution;

    let responseTab: 'logs' | 'errors' | 'headers' | 'body' = 'logs';

    onMount(() => {
        if (selectedLog?.logs) {
            responseTab = 'logs';
        } else if (selectedLog.requestHeaders?.length) {
            responseTab = 'headers';
        }
    });
</script>

<Layout.Stack>
    <Layout.Stack gap="none">
        <Tabs.Root variant="secondary" let:root>
            <Tabs.Item.Button
                {root}
                active={responseTab === 'logs'}
                on:click={() => (responseTab = 'logs')}>
                Logs
            </Tabs.Item.Button>
            <!-- <Tabs.Item.Button
                {root}
                active={responseTab === 'errors'}
                on:click={() => (responseTab = 'errors')}>
                Errors
            </Tabs.Item.Button> -->
            <Tabs.Item.Button
                {root}
                active={responseTab === 'headers'}
                on:click={() => (responseTab = 'headers')}>
                Headers <Badge
                    variant="secondary"
                    size="s"
                    content={selectedLog?.responseHeaders?.length?.toString()} />
            </Tabs.Item.Button>
        </Tabs.Root>
        <Divider />
    </Layout.Stack>

    {#if responseTab === 'logs'}
        {#if selectedLog.logs}
            <Logs logs={selectedLog.logs} />
        {:else}
            <Card padding="xs" radius="s">
                <Typography.Code>No logs found.</Typography.Code>
            </Card>
        {/if}
    {:else if responseTab === 'errors'}
        {#if selectedLog.errors}
            <Logs logs={selectedLog.errors} />
        {:else}
            <Card padding="xs" radius="s">
                <Typography.Code>No errors found.</Typography.Code>
            </Card>
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

            <Input.Helper state="default">
                <span>
                    Missing headers? Check the <Link variant="muted" href="#" external>docs</Link> to
                    see the supported data and how to log it.
                </span>
            </Input.Helper>
        {:else}
            <Card padding="xs" radius="s">
                <Typography.Code>No headers found.</Typography.Code>
            </Card>
        {/if}
    {:else if responseTab === 'body'}
        {#if selectedLog.responseBody}
            <Logs logs={selectedLog.responseBody} />
        {:else}
            <Card padding="xs" radius="s">
                <Typography.Code>No parameters found.</Typography.Code>
            </Card>
        {/if}
    {/if}
</Layout.Stack>
