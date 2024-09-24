<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { Empty, Heading, Trim } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { Browser, type Models } from '@appwrite.io/console';
    import type { PageData } from './$types';

    export let data: PageData;

    function getBrowser(clientCode: string) {
        const code = clientCode.toLowerCase();
        if (!isValueOfStringEnum(Browser, code)) return '';
        return sdk.forProject.avatars.getBrowser(code, 40, 40);
    }

    async function logout(session: Models.Session) {
        await sdk.forConsole.account.deleteSession(session.$id);
        await invalidate(Dependencies.ACCOUNT_SESSIONS);
        trackEvent(Submit.AccountDeleteSession);
        if (session.current) {
            await goto(`${base}/login`);
        }
    }

    async function logoutAll() {
        await sdk.forConsole.account.deleteSessions();
        await invalidate(Dependencies.ACCOUNT_SESSIONS);
        trackEvent(Submit.AccountDeleteAllSessions);
        await goto(`${base}/login`);
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Sessions</Heading>

        <Button secondary on:click={logoutAll}>
            <span class="text">Sign out all sessions</span>
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
                    {@const browser = getBrowser(session.clientCode)}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-gap-12 u-cross-center">
                                {#if session.clientName}
                                    <div class="avatar">
                                        {#if browser}
                                            <img
                                                height="20"
                                                width="20"
                                                src={getBrowser(session.clientCode).toString()}
                                                style="--p-text-size: 1.25rem"
                                                alt={session.clientName} />
                                        {:else}
                                            <span
                                                class="icon-globe-alt"
                                                style="--p-text-size: 1.25rem"
                                                aria-hidden="true" />
                                        {/if}
                                    </div>
                                    <Trim>
                                        {session.clientName}
                                        {session.clientVersion}
                                        on {session.osName}
                                        {session.osVersion}
                                    </Trim>
                                {:else}
                                    <span class="avatar is-color-empty" />
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
                            <Button secondary on:click={() => logout(session)}>Sign out</Button>
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
                        href="https://appwrite.io/docs/references/cloud/client-web/account#createEmailPasswordSession">
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
