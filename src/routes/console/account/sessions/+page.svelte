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
    import LL from '$i18n/i18n-svelte';

    export let data: PageData;

    function getBrowser(clientCode: string) {
        return sdk.forConsole.avatars.getBrowser(clientCode, 40, 40);
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
        <Heading tag="h2" size="5">{$LL.console.account.title.sessions()}</Heading>

        <Button secondary on:click={logoutAll}>
            <span class="text">{$LL.console.account.button.logoutAllSessions()}</span>
        </Button>
    </div>

    {#if data.sessions.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={250}
                    >{$LL.console.account.table.header.client()}</TableCellHead>
                <TableCellHead width={70}
                    >{$LL.console.account.table.header.location()}</TableCellHead>
                <TableCellHead width={90}>{$LL.console.account.table.header.ip()}</TableCellHead>
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
                                        {$LL.console.account.table.trim.on()}
                                        {session.osName}
                                        {session.osVersion}
                                    </Trim>
                                {:else}
                                    <span class="avatar is-color-empty" />
                                    <p class="text u-trim">
                                        {$LL.console.account.table.texts.unknown()}
                                    </p>
                                {/if}
                                <div class="is-only-desktop">
                                    <Pill>{session.provider}</Pill>
                                </div>
                                {#if session.current}
                                    <Pill success
                                        >{$LL.console.account.table.pill.alert.current()}</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Location">
                            {#if session.countryCode !== '--'}
                                {session.countryName}
                            {:else}
                                {$LL.console.account.table.texts.unknown()}
                            {/if}
                        </TableCellText>
                        <TableCellText title="IP">{session.ip}</TableCellText>
                        <TableCell title="Client">
                            <Button secondary on:click={() => logout(session)}
                                >{$LL.console.account.button.logout()}</Button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>
    {:else}
        <Empty>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <p>{$LL.console.account.texts.noSession()}</p>
                </div>
                <div class="common-section">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/client/account#accountCreateEmailSession">
                        {$LL.console.account.button.documentation()}
                    </Button>
                </div>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">{$LL.console.account.texts.totalResult()} {data.sessions.total}</p>
    </div>
</Container>
