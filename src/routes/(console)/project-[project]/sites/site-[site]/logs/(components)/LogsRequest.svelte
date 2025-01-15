<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Table, Tabs } from '@appwrite.io/pink-svelte';

    export let selectedLog: Models.Execution;

    let requestTab: 'parameters' | 'headers' | 'body' = 'parameters';
</script>

<Layout.Stack>
    <Tabs.Root>
        <Tabs.Item.Button
            active={requestTab === 'parameters'}
            on:click={() => (requestTab = 'parameters')}>
            Parameters
        </Tabs.Item.Button>
        <Tabs.Item.Button
            active={requestTab === 'headers'}
            on:click={() => (requestTab = 'headers')}>
            Headers <Badge
                variant="secondary"
                size="s"
                content={selectedLog?.requestHeaders?.length?.toString()} />
        </Tabs.Item.Button>
        <Tabs.Item.Button active={requestTab === 'body'} on:click={() => (requestTab = 'body')}>
            Body
        </Tabs.Item.Button>
    </Tabs.Root>
    {#if requestTab === 'parameters'}
        parameters
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
                    <Icon icon={IconInfo} size="s" color="--color-fgcolor-neutral-secondary" /> Missing
                    headers? Check our docs to see the supported data and how to log it.
                </Layout.Stack>
            </p>
        {:else}
            no headers
        {/if}
    {:else if requestTab === 'body'}
        body
    {/if}
</Layout.Stack>
