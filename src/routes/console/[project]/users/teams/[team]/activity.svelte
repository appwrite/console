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
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';

    let offset = 0;
    const limit = 5;

    $: request = sdkForProject.teams.listLogs($page.params.team, limit, offset);
</script>

<Container>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Table>
                <TableHeader>
                    <TableCellHead>Client</TableCellHead>
                    <TableCellHead>Event</TableCellHead>
                    <TableCellHead>Location</TableCellHead>
                    <TableCellHead>IP</TableCellHead>
                    <TableCellHead>Date</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each response.logs as log}
                        <TableRow>
                            <TableCellText title="Client">
                                <img
                                    height="32"
                                    width="32"
                                    src={`/icons/color/${log?.clientName.toLocaleLowerCase()}.svg`}
                                    alt={log.clientName} />
                                <span class="">
                                    <p>
                                        {log.clientName}
                                        {log.clientVersion}
                                    </p>
                                    <span class="u-small">
                                        on {log.osName}
                                        {log.osVersion}
                                    </span>
                                </span>
                            </TableCellText>
                            <TableCellText title="Event">{log.event}</TableCellText>

                            <TableCellText title="Location">
                                {#if log.countryCode !== '--'}
                                    {log.countryName}
                                {:else}
                                    Unknown
                                {/if}
                            </TableCellText>
                            <TableCellText title="IP">{log.ip}</TableCellText>
                            <TableCellText title="Date">{toLocaleDateTime(log.time)}</TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            <Empty centered>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <p>No logs available</p>
                    </div>
                    <div class="common-section">
                        <Button external secondary href="https://appwrite.io/docs/server/teams"
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
