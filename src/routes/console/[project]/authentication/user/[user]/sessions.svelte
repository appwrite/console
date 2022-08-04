<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, Pagination } from '$lib/components';
    import {
        Table,
        TableBody,
        TableHeader,
        TableRow,
        TableCellHead,
        TableCellText
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import DeleteAllSessions from './_deleteAllSessions.svelte';
    import DeleteSessions from './_deleteSession.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';

    let offset = 0;
    let showDelete = false;
    let showDeleteAll = false;
    let selectedSessionId: string = null;

    const limit = 5;
    const request = sdkForProject.users.getSessions($page.params.user);

    //TODO: replace session.expire with "last activity"
</script>

<Container>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <div class="u-flex u-main-end  common-section">
                <Button secondary on:click={() => (showDeleteAll = true)}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Delete All</span>
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableCellHead>Browser</TableCellHead>
                    <TableCellHead>Device</TableCellHead>
                    <TableCellHead>IP</TableCellHead>
                    <TableCellHead width={30} />
                </TableHeader>
                <TableBody>
                    {#each response.sessions as session}
                        <TableRow>
                            <TableCellText title="Client">
                                <div class="u-flex u-cross-center u-gap-12">
                                    <div class="image-item">
                                        <img
                                            height="20"
                                            width="20"
                                            src={`/icons/${
                                                $app.themeInUse
                                            }/color/${session?.clientName.toLocaleLowerCase()}.svg`}
                                            alt={session.clientName} />
                                    </div>
                                    <span class="u-line-height-1-5">
                                        <p>{session.clientName}</p>
                                        <span class="u-small">
                                            Last activity: {toLocaleDateTime(session?.expire)}
                                        </span></span>
                                </div>
                            </TableCellText>

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
            <Empty centered>
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
        <div
            class="u-flex u-margin-block-start-32
 u-main-space-between">
            <p class="text">Total results: {response.total}</p>
            <Pagination {limit} bind:offset sum={response.total} />
        </div>
    {/await}
</Container>

<DeleteSessions {selectedSessionId} bind:showDelete />
<DeleteAllSessions bind:showDeleteAll />
