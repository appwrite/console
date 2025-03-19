<script lang="ts">
    import { Card } from '$lib/components';
    import { Link } from '$lib/elements';
    import type { Models } from '@appwrite.io/console';
    import {
        Badge,
        Divider,
        Input,
        Layout,
        Table,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let selectedLog: Models.Execution;

    let requestTab: 'parameters' | 'headers' = 'parameters';

    let parameters = [];

    onMount(() => {
        try {
            // Add dummy base URL to parse relative paths
            const url = new URL(selectedLog.requestPath, 'http://dummy.local');
            if (url.search) {
                parameters = Array.from(url.searchParams.entries()).map(([name, value]) => ({
                    name,
                    value: decodeURIComponent(value)
                }));
            }
        } catch (error) {
            parameters = [];
        }
    });

    onMount(() => {
        if (parameters?.length) {
            requestTab = 'parameters';
        } else if (selectedLog.requestHeaders?.length) {
            requestTab = 'headers';
        }
    });
</script>

<Layout.Stack>
    <Layout.Stack gap="none">
        <Tabs.Root variant="secondary" let:root>
            <Tabs.Item.Button
                {root}
                active={requestTab === 'parameters'}
                on:click={() => (requestTab = 'parameters')}>
                Parameters
                <Badge variant="secondary" size="s" content={parameters?.length?.toString()} />
            </Tabs.Item.Button>
            <Tabs.Item.Button
                {root}
                active={requestTab === 'headers'}
                on:click={() => (requestTab = 'headers')}>
                Headers <Badge
                    variant="secondary"
                    size="s"
                    content={selectedLog?.requestHeaders?.length?.toString()} />
            </Tabs.Item.Button>
        </Tabs.Root>
        <Divider />
    </Layout.Stack>
    {#if requestTab === 'parameters'}
        {#if parameters?.length}
            <Table.Root columns={2} let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell {root}>Key</Table.Header.Cell>
                    <Table.Header.Cell {root}>Value</Table.Header.Cell>
                </svelte:fragment>
                {#each parameters as parameter}
                    <Table.Row.Base {root}>
                        <Table.Cell {root}>{parameter.name}</Table.Cell>
                        <Table.Cell {root}>{parameter.value}</Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
        {:else}
            <Card isTile padding="xs" radius="s">
                <Typography.Code>No parameters found.</Typography.Code>
            </Card>
        {/if}
    {:else if requestTab === 'headers'}
        {#if selectedLog.requestHeaders?.length}
            <Table.Root columns={2} let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell {root}>Key</Table.Header.Cell>
                    <Table.Header.Cell {root}>Value</Table.Header.Cell>
                </svelte:fragment>
                {#each selectedLog.requestHeaders as request}
                    <Table.Row.Base {root}>
                        <Table.Cell {root}>{request.name}</Table.Cell>
                        <Table.Cell {root}>{request.value}</Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>

            <Input.Helper state="default">
                <span>
                    Missing headers? Check the <Link variant="muted" href="#" external>docs</Link> to
                    see the supported data and how to log it.
                </span>
            </Input.Helper>
        {:else}
            <Card isTile padding="xs" radius="s">
                <Typography.Code>No headers found.</Typography.Code>
            </Card>
        {/if}
    {/if}
</Layout.Stack>
