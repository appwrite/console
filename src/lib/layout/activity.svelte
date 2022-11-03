<script lang="ts">
    import { Empty, Pagination, Trim } from '$lib/components';
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
    import { sdkForConsole } from '$lib/stores/sdk';
    import { PAGE_LIMIT } from '$lib/constants';
    import type { Models } from '@aw-labs/appwrite-console';

    export let logs: Models.LogList;
    export let path: string;
    export let offset = 0;

    const getBrowser = (clientCode: string) => {
        return sdkForConsole.avatars.getBrowser(clientCode, 40, 40);
    };
</script>

<Container>
    {#if logs.total}
        <Table>
            <TableHeader>
                <TableCellHead>Client</TableCellHead>
                <TableCellHead>Event</TableCellHead>
                <TableCellHead>Location</TableCellHead>
                <TableCellHead>IP</TableCellHead>
                <TableCellHead>Date</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each logs.logs as log}
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
                                    <Trim>
                                        {log.clientName}
                                        {log.clientVersion}
                                        on {log.osName}
                                        {log.osVersion}
                                    </Trim>
                                </div>
                            {:else}
                                <div class="u-flex u-cross-center u-gap-12">
                                    <span class="avatar  is-color-empty" />
                                    <p class="text u-trim">Unknown</p>
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
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/server/authentication?sdk=nodejs-default#usersGetLogs">
                        Documentation
                    </Button>
                </div>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {logs.total}</p>
        <Pagination limit={PAGE_LIMIT} {path} {offset} sum={logs.total} />
    </div>
</Container>
