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
        TableCell,
        TableCellText
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { pageLimit } from '$lib/stores/layout';
    import { Query } from '@aw-labs/appwrite-console';
    import { createPersistentPagination } from '$lib/stores/pagination';

    const offset = createPersistentPagination($pageLimit);

    $: request = sdkForProject.teams.listLogs($page.params.team, [
        Query.limit($pageLimit),
        Query.offset($offset)
    ]);

    const getBrowser = (clientCode: string) => {
        return sdkForProject.avatars.getBrowser(clientCode, 80, 80);
    };
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
                            <TableCell title="Client">
                                {#if log.clientName}
                                    <div class="u-flex u-cross-center u-gap-12">
                                        <div class="avatar is-small">
                                            <img
                                                height="20"
                                                width="20"
                                                src={getBrowser(log.clientCode).toString()}
                                                alt={log.clientName} />
                                        </div>
                                        <p class="text u-trim">
                                            {log.clientName}
                                            {log.clientVersion}
                                            on {log.osName}
                                            {log.osVersion}
                                        </p>
                                    </div>
                                {:else}
                                    <div class="u-flex u-cross-center u-gap-12">
                                        <p class="text u-trim">
                                            <span class="avatar  is-color-empty" />
                                            Unknown
                                        </p>
                                    </div>
                                {/if}
                            </TableCell>
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
            <Empty>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <p>No logs available</p>
                    </div>
                    <div class="common-section">
                        <Button external secondary href="https://appwrite.io/docs/server/teams">
                            Documentation
                        </Button>
                    </div>
                </div>
            </Empty>
        {/if}
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {response.total}</p>
            <Pagination limit={$pageLimit} bind:offset={$offset} sum={response.total} />
        </div>
    {/await}
</Container>
