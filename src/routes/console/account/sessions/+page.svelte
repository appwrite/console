<script lang="ts">
    import { Empty, Heading, Pagination } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
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
    import { sdkForConsole } from '$lib/stores/sdk';
    import { pageLimit } from '$lib/stores/layout';
    import type { Models } from '@aw-labs/appwrite-console';
    import { accountSession } from '../store';
    import { onMount } from 'svelte';
    import { createPersistentPagination } from '$lib/stores/pagination';

    const offset = createPersistentPagination($pageLimit);

    onMount(async () => {
        await accountSession.load();
    });

    const getBrowser = (clientCode: string) => {
        return sdkForConsole.avatars.getBrowser(clientCode, 40, 40);
    };

    const logout = async (session: Models.Session) => {
        await sdkForConsole.account.deleteSession(session.$id);
        await accountSession.load();
    };
    const logoutAll = async () => {
        await sdkForConsole.account.deleteSessions();
        await accountSession.load();
    };
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Sessions</Heading>

        <Button secondary on:click={logoutAll}>
            <span class="text">Logout all sessions</span>
        </Button>
    </div>

    {#if $accountSession?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Client</TableCellHead>
                <TableCellHead width={100}>Location</TableCellHead>
                <TableCellHead width={150}>IP</TableCellHead>
                <TableCellHead width={100} />
            </TableHeader>
            <TableBody>
                {#each $accountSession.sessions as session}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-gap-12">
                                <div class="u-flex u-cross-center u-gap-12">
                                    {#if session.clientName}
                                        <div class="avatar is-small">
                                            <img
                                                height="20"
                                                width="20"
                                                src={getBrowser(session.clientCode).toString()}
                                                alt={session.clientName} />
                                        </div>
                                        <p class="text u-trim">
                                            {session.clientName}
                                            {session.clientVersion}
                                            on {session.osName}
                                            {session.osVersion}
                                        </p>
                                    {:else}
                                        <span class="avatar  is-color-empty" />
                                        <p class="text u-trim">Unknown</p>
                                    {/if}
                                </div>

                                <Pill>{session.provider}</Pill>
                                {#if session.current}
                                    <Pill success>current session</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Location">
                            {#if session.countryCode !== '--'}
                                {session.countryName}
                            {:else}
                                Unknown
                            {/if}
                        </TableCellText>
                        <TableCellText title="IP">{session.ip}</TableCellText>
                        <TableCell title="Client">
                            <Button secondary on:click={() => logout(session)}>Logout</Button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <Empty>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <p>No sessions available</p>
                </div>
                <div class="common-section">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/server/authentication?sdk=nodejs-default#usersGetsessions">
                        Documentation
                    </Button>
                </div>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {$accountSession?.total}</p>
        <Pagination limit={$pageLimit} bind:offset={$offset} sum={$accountSession?.total} />
    </div>
</Container>
