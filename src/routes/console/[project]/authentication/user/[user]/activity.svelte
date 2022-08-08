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
    import { app } from '$lib/stores/app';

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
                                <div class="u-flex u-cross-center u-gap-12">
                                    <div class="avatar is-small">
                                        <img
                                            height="20"
                                            width="20"
                                            src={`/icons/${
                                                $app.themeInUse
                                            }/color/${log?.clientName.toLocaleLowerCase()}.svg`}
                                            alt={log.clientName} />
                                    </div>
                                    <p class="text u-trim">
                                        {log.clientName}
                                        {log.clientVersion}
                                        on {log.osName}
                                        {log.osVersion}
                                    </p>
                                </div>
                            </TableCellText>
                            <TableCellText title="Event">{log.event}</TableCellText>

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
                        <Button
                            external
                            secondary
                            href="https://appwrite.io/docs/server/authentication?sdk=nodejs-default#usersGetLogs"
                            >Documentation</Button>
                    </div>
                </div>
            </Empty>
        {/if}
        <div
            class="u-flex u-margin-block-start-32
 u-main-space-between">
            <p class="text">Total results: {response.total}</p>
            <Pagination {limit} bind:offset sum={response.total} />
        </div>
    {/await}
</Container>
