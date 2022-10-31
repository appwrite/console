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
    import { sdkForProject } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { PAGE_LIMIT } from '$lib/constants';
    import { page } from '$app/stores';

    export let data: PageData;

    const getBrowser = (clientCode: string) => sdkForProject.avatars.getBrowser(clientCode, 80, 80);
</script>

<Container>
    {#if data.logs.total}
        <Table>
            <TableHeader>
                <TableCellHead>Client</TableCellHead>
                <TableCellHead>Event</TableCellHead>
                <TableCellHead>Location</TableCellHead>
                <TableCellHead>IP</TableCellHead>
                <TableCellHead>Date</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.logs.logs as log}
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
        <p class="text">Total results: {data.logs.total}</p>
        <Pagination
            limit={PAGE_LIMIT}
            path={`/console/project-${$page.params.project}/authentication/teams/team-${$page.params.team}/activity`}
            offset={data.offset}
            sum={data.logs.total} />
    </div>
</Container>
