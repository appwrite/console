<script lang="ts">
    import { AvatarInitials, EmptySearch, Pagination, Trim } from '$lib/components';
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
    import { PAGE_LIMIT } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';

    export let logs: Models.LogList;
    export let path: string;
    export let offset = 0;
</script>

<Container>
    {#if logs.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={100}>User</TableCellHead>
                <TableCellHead width={100}>Event</TableCellHead>
                <TableCellHead width={80}>Location</TableCellHead>
                <TableCellHead width={90}>IP</TableCellHead>
                <TableCellHead width={140}>Date</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each logs.logs as log}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-cross-center u-gap-12">
                                {#if log.userEmail}
                                    {#if log.userName}
                                        <AvatarInitials size={32} name={log.userName} />
                                        <Trim>{log.userName}</Trim>
                                    {:else}
                                        <AvatarInitials size={32} name={log.userEmail} />
                                        <Trim>{log.userEmail}</Trim>
                                    {/if}
                                {:else}
                                    <div class="avatar is-size-small ">
                                        <span class="icon-anonymous" aria-hidden="true" />
                                    </div>
                                    <span class="text u-trim">{log.userName ?? 'Anonymous'}</span>
                                {/if}
                            </div>
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
