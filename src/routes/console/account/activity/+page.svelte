<script lang="ts">
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
    import { sdkForConsole } from '$lib/stores/sdk';
    import { pageLimit } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { accountActivity } from '../store';

    let offset = 0;

    onMount(async () => {
        await accountActivity.load($pageLimit, offset);
    });

    $: accountActivity.load($pageLimit, offset);

    const getBrowser = (clientCode: string) => {
        return sdkForConsole.avatars.getBrowser(clientCode, 40, 40);
    };
</script>

<Container>
    {#if $accountActivity?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Date</TableCellHead>
                <TableCellHead>Event</TableCellHead>
                <TableCellHead>Client</TableCellHead>
                <TableCellHead>Location</TableCellHead>
                <TableCellHead>IP</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $accountActivity.logs as log}
                    <TableRow>
                        <TableCellText title="Date">{toLocaleDateTime(log.time)}</TableCellText>
                        <TableCellText title="Event">{log.event}</TableCellText>

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
                                    <p
                                        class="text u-trim"
                                        title={`${log.clientName} ${log.clientVersion} on ${log.osName} ${log.osVersion}`}>
                                        {log.clientName}
                                        {log.clientVersion}
                                        on {log.osName}
                                        {log.osVersion}
                                    </p>
                                </div>
                            {:else}
                                <div class="u-flex u-cross-center u-gap-12">
                                    <span class="avatar  is-color-empty" />
                                    <p class="text u-trim">Unknown</p>
                                </div>
                            {/if}
                        </TableCell>

                        <TableCellText title="Location">
                            {#if log.countryCode !== '--'}
                                {log.countryName}
                            {:else}
                                Unknown
                            {/if}
                        </TableCellText>
                        <TableCellText title="IP">{log.ip}</TableCellText>
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
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/server/authentication?sdk=nodejs-default#usersGetLogs"
                        >Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {$accountActivity?.total}</p>
        <Pagination limit={$pageLimit} bind:offset sum={$accountActivity?.total} />
    </div>
</Container>
