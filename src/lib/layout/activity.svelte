<script lang="ts">
    import { EmptySearch, Pagination, Trim } from '$lib/components';
    import {
        TableBody,
        TableHeader,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText,
        TableScroll
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
        <TableScroll>
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
        </TableScroll>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {logs.total}</p>
            <Pagination limit={PAGE_LIMIT} {path} {offset} sum={logs.total} />
        </div>
    {:else}
        <EmptySearch>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="u-text-center">
                    <p class="text u-line-height-1-5">
                        You have no activity. Once your users start interacting with your app you'll
                        see their activity here.
                    </p>
                </div>
            </div>
        </EmptySearch>
    {/if}
</Container>
