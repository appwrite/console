<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, Pagination } from '$lib/components';
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
    import { sdkForProject } from '$lib/stores/sdk';
    import DeleteAllSessions from '../_deleteAllSessions.svelte';
    import DeleteSessions from '../_deleteSession.svelte';
    import { pageLimit } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import type { Models } from '@aw-labs/appwrite-console';

    let offset = 0;
    let showDelete = false;
    let showDeleteAll = false;
    let selectedSessionId: string = null;
    let sessionList: Models.SessionList = null;
    onMount(async () => {
        sessionList = await sdkForProject.users.listSessions($page.params.user);
    });

    const getBrowser = (clientCode: string) => {
        return sdkForProject.avatars.getBrowser(clientCode, 40, 40);
    };
</script>

<Container>
    {#if sessionList?.total}
        <div class="u-flex u-main-end  common-section">
            <Button secondary on:click={() => (showDeleteAll = true)}>
                <span class="text">Delete All</span>
            </Button>
        </div>
        <Table>
            <TableHeader>
                <TableCellHead>Browser and Device</TableCellHead>
                <TableCellHead width={140}>Session</TableCellHead>
                <TableCellHead width={140}>Location</TableCellHead>
                <TableCellHead width={140}>IP</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each sessionList.sessions as session}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-gap-12">
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
                        <TableCellText title="">
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                on:click={() => {
                                    selectedSessionId = session.$id;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <Empty>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <p>No session available</p>
                </div>
                <div class="common-section">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/server/authentication?sdk=nodejs-default#usersGetSessions"
                        >Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {sessionList?.total}</p>
        <Pagination limit={$pageLimit} bind:offset sum={sessionList?.total} />
    </div>
</Container>

<DeleteSessions {selectedSessionId} bind:showDelete />
<DeleteAllSessions bind:showDeleteAll />
