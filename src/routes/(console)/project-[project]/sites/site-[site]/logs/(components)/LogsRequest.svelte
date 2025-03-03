<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Table, Tabs, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let selectedLog: Models.Execution;

    let requestTab: 'parameters' | 'headers' | 'body' = 'parameters';

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
</script>

<Layout.Stack>
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
        <Tabs.Item.Button
            {root}
            active={requestTab === 'body'}
            on:click={() => (requestTab = 'body')}>
            Body
        </Tabs.Item.Button>
    </Tabs.Root>
    {#if requestTab === 'parameters'}
        {#if parameters?.length}
            <Table.Root>
                <svelte:fragment slot="header">
                    <Table.Header.Cell>Key</Table.Header.Cell>
                    <Table.Header.Cell>Value</Table.Header.Cell>
                </svelte:fragment>
                {#each parameters as parameter}
                    <Table.Row>
                        <Table.Cell>{parameter.name}</Table.Cell>
                        <Table.Cell>{parameter.value}</Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Root>
        {:else}
            <Typography.Code>No parameters found.</Typography.Code>
        {/if}
    {:else if requestTab === 'headers'}
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
            <p>
                <Layout.Stack direction="row" gap="xs" alignItems="center">
                    <Icon icon={IconInfo} size="s" color="--fgcolor-neutral-secondary" /> Missing headers?
                    Check our docs to see the supported data and how to log it.
                </Layout.Stack>
            </p>
        {:else}
            <Typography.Code>No headers found.</Typography.Code>
        {/if}
    {:else if requestTab === 'body'}
        <Typography.Code>No body found.</Typography.Code>
    {/if}
</Layout.Stack>
