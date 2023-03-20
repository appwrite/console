<script lang="ts">
    import { EmptySearch } from '$lib/components';
    import {
        Table,
        TableBody,
        TableHeader,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText
    } from '$lib/elements/table';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import DeleteAllSessions from '../../deleteAllSessions.svelte';
    import DeleteSessions from '../../deleteSession.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let showDelete = false;
    let showDeleteAll = false;
    let selectedSessionId: string;

    const getBrowser = (clientCode: string) =>
        sdk.forProject.avatars.getBrowser(clientCode, 40, 40);
</script>

<Container>
    {#if data.sessions.total}
        <div class="u-flex u-main-end  common-section">
            <Button secondary on:click={() => (showDeleteAll = true)}>
                <span class="text">Delete All</span>
            </Button>
        </div>
        <Table>
            <TableHeader>
                <TableCellHead width={140}>Browser and Device</TableCellHead>
                <TableCellHead width={140}>Session</TableCellHead>
                <TableCellHead width={140}>Location</TableCellHead>
                <TableCellHead width={140}>IP</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.sessions.sessions as session}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <div class="image-item">
                                    <img
                                        height="20"
                                        width="20"
                                        src={getBrowser(session.clientCode).toString()}
                                        alt={session.clientName} />
                                </div>
                                <p class="text">
                                    {session.clientName}
                                    {session.clientVersion} on {session.osName}
                                    {session.osVersion}
                                </p>
                                {#if session.current}
                                    <Pill success>current session</Pill>
                                {/if}
                            </div>
                        </TableCell>

                        <TableCellText title="Session">{session.clientType}</TableCellText>
                        <TableCellText title="Location">{session.countryName}</TableCellText>
                        <TableCellText title="IP">{session.ip}</TableCellText>
                        <TableCell>
                            <Button
                                text
                                round
                                ariaLabel="Delete item"
                                on:click={() => {
                                    selectedSessionId = session.$id;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </Button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <EmptySearch>
            <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
                <p class="text u-line-height-1-5">No sessions available</p>
                <Button
                    external
                    secondary
                    href="https://appwrite.io/docs/server/users?sdk=nodejs-default#usersListSessions">
                    Documentation
                </Button>
            </div>
        </EmptySearch>
    {/if}
</Container>

<DeleteSessions {selectedSessionId} bind:showDelete />
<DeleteAllSessions bind:showDeleteAll />
