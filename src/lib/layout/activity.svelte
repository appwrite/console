<script lang="ts">
    import { AvatarInitials, PaginationWithLimit, Trim } from '$lib/components';
    import { Container } from '$lib/layout';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Table, Card, Empty } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';

    export let logs: Models.LogList;
    export let offset = 0;
    export let limit = 0;
</script>

<Container>
    {#if logs.total}
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>User</Table.Header.Cell>
                <Table.Header.Cell>Event</Table.Header.Cell>
                <Table.Header.Cell>Location</Table.Header.Cell>
                <Table.Header.Cell>IP</Table.Header.Cell>
                <Table.Header.Cell>Date</Table.Header.Cell>
            </svelte:fragment>
            {#each logs.logs as log}
                <Table.Row>
                    <Table.Cell>
                        <Layout.Stack direction="row" alignItems="center">
                            {#if log.userEmail}
                                {#if log.userName}
                                    <AvatarInitials size="xs" name={log.userName} />
                                    <Trim>{log.userName}</Trim>
                                {:else}
                                    <AvatarInitials size="xs" name={log.userEmail} />
                                    <Trim>{log.userEmail}</Trim>
                                {/if}
                            {:else}
                                <div class="avatar is-size-small">
                                    <span class="icon-anonymous" aria-hidden="true" />
                                </div>
                                <span class="text u-trim">{log.userName ?? 'Anonymous'}</span>
                            {/if}
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell>
                        {log.event}
                    </Table.Cell>
                    <Table.Cell>
                        {#if log.countryCode !== '--'}
                            {log.countryName}
                        {:else}
                            Unknown
                        {/if}
                    </Table.Cell>
                    <Table.Cell>
                        {log.ip}
                    </Table.Cell>
                    <Table.Cell>
                        {toLocaleDateTime(log.time)}
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Root>

        <PaginationWithLimit name="Logs" {limit} {offset} total={logs.total} />
    {:else}
        <Card.Base padding="none">
            <Empty
                title="No activities available"
                description="Need a hand? Learn more in our documentation."
                type="secondary">
                <svelte:fragment slot="actions">
                    <Button external secondary href="https://appwrite.io/docs">
                        Documentation
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
