<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, Pagination } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableHeader,
        TableRow,
        TableCellHead,
        TableCellText
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';

    let offset = 0;
    const limit = 25;

    $: request = sdkForProject.users.getLogs($page.params.user, limit, offset);
</script>

<Container>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Table>
                <TableHeader>
                    <TableCellHead>Date</TableCellHead>
                    <TableCellHead>Event</TableCellHead>
                    <TableCellHead>Client</TableCellHead>
                    <TableCellHead>Location</TableCellHead>
                    <TableCellHead>IP</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each response.logs as log}
                        <TableRow>
                            <TableCellText title="Date">{log.time}</TableCellText>
                            <TableCellText title="Event">{log.event}</TableCellText>
                            <TableCellText title="Client">
                                {log.clientName}
                                {log.clientVersion} on {log.osName}
                                {log.osVersion}
                            </TableCellText>
                            <TableCellText title="Location">
                                {#if log.countryCode !== '--'}
                                    <img
                                        src={sdkForProject.avatars
                                            .getFlag(log.countryCode, 32, 32)
                                            .toString()}
                                        alt={log.countryName} />{log.countryName}
                                {:else}
                                    Unknown
                                {/if}
                            </TableCellText>
                            <TableCellText title="IP">{log.ip}</TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
            <Pagination {limit} bind:offset sum={response.total} />
        {:else}
            <Empty centered>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <p>No logs available</p>
                    </div>
                    <div class="common-section">
                        <Button
                            external
                            secondary
                            href="https://appwrite.io/docs/server/users?sdk=nodejs-default#usersGetLogs"
                            >Documentation</Button>
                    </div>
                </div>
            </Empty>
        {/if}
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {response.total}</p>
            <Pagination {limit} bind:offset sum={response.total} />
        </div>
    {/await}
</Container>
