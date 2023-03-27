<script lang="ts">
    import { Empty, Heading, Trim } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
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
    import { sdk } from '$lib/stores/sdk';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';

    export let data: PageData;

    function getBrowser(clientCode: string) {
        return sdk.forConsole.avatars.getBrowser(clientCode, 40, 40);
    }

    async function logout(session: Models.Session) {
        await sdk.forConsole.account.deleteSession(session.$id);
        trackEvent(Submit.AccountDeleteSession);
        if (session.current) {
            await goto(`${base}/login`);
        }
        invalidate(Dependencies.ACCOUNT_SESSIONS);
    }

    async function logoutAll() {
        await sdk.forConsole.account.deleteSessions();
        trackEvent(Submit.AccountDeleteAllSessions);
        await goto(`${base}/login`);
        invalidate(Dependencies.ACCOUNT_SESSIONS);
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Sessions</Heading>

        <Button secondary on:click={logoutAll}>
            <span class="text">Logout all sessions</span>
        </Button>
    </div>

    {#if data.sessions.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={250}>Client</TableCellHead>
                <TableCellHead width={70}>Location</TableCellHead>
                <TableCellHead width={90}>IP</TableCellHead>
                <TableCellHead width={60} />
            </TableHeader>
            <TableBody>
                {#each data.sessions.sessions as session}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-gap-12 u-cross-center">
                                {#if session.clientName}
                                    <div class="avatar is-small">
                                        <img
                                            height="20"
                                            width="20"
                                            src={getBrowser(session.clientCode).toString()}
                                            alt={session.clientName} />
                                    </div>
                                    <Trim>
                                        {session.clientName}
                                        {session.clientVersion}
                                        on {session.osName}
                                        {session.osVersion}
                                    </Trim>
                                {:else}
                                    <span class="avatar  is-color-empty" />
                                    <p class="text u-trim">Unknown</p>
                                {/if}
                                <div class="is-only-desktop">
                                    <Pill>{session.provider}</Pill>
                                </div>
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
        </TableScroll>
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
                        href="https://appwrite.io/docs/client/account#accountCreateEmailSession">
                        Documentation
                    </Button>
                </div>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {data.sessions.total}</p>
    </div>
</Container>
