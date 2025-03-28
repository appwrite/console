<script lang="ts">
    import { page } from '$app/stores';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { Trim } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { Browser, type Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';
    import { Badge, Layout, Table, Typography } from '@appwrite.io/pink-svelte';

    export let data: PageData;

    function getBrowser(clientCode: string) {
        const code = clientCode.toLowerCase();
        if (!isValueOfStringEnum(Browser, code)) return '';
        return sdk.forProject.avatars.getBrowser(code, 40, 40);
    }

    function logoutSessionId(sessionId: string) {
        const session = data.sessions.sessions.find((s) => s.$id === sessionId);
        if (session) {
            logout(session);
        }
    }

    async function logout(session: Models.Session) {
        let result;
        try {
            result = await sdk.forConsole.account.deleteSession(session.$id);
        } catch (e) {
            addNotification({
                type: 'error',
                message: `There was an error deleting your user session. <a href="?sessionId=${session.$id}" class="u-underline">Try again</a>`,
                isHtml: true
            });
        }

        if (result) {
            trackEvent(Submit.AccountDeleteSession);
            if (session.current) {
                await invalidate(Dependencies.ACCOUNT);
                await goto(`${base}/login`);
            } else {
                await invalidate(Dependencies.ACCOUNT_SESSIONS);
                addNotification({
                    type: 'success',
                    message: `User session has been deleted`
                });
            }
        }
    }

    async function logoutAll() {
        await sdk.forConsole.account.deleteSessions();
        await invalidate(Dependencies.ACCOUNT_SESSIONS);
        trackEvent(Submit.AccountDeleteAllSessions);
        await goto(`${base}/login`);
    }

    onMount(() => {
        return page.subscribe(($page) => {
            const url = new URL($page.url);
            const sessionId = url.searchParams.get('sessionId');
            if (sessionId) {
                logoutSessionId(sessionId);
            }

            // Clear the sessionId param from the URL
            url.searchParams.delete('sessionId');
            goto(url.pathname + url.search, { replaceState: true });
        });
    });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Typography.Title>Sessions</Typography.Title>
        <Button secondary on:click={logoutAll}>Sign out all sessions</Button>
    </Layout.Stack>

    <Table.Root
        let:root
        columns={[
            { id: 'client' },
            { id: 'location' },
            { id: 'ip' },
            { id: 'actions', width: 40 }
        ]}>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell column="client" {root}>Client</Table.Header.Cell>
            <Table.Header.Cell column="location" {root}>Location</Table.Header.Cell>
            <Table.Header.Cell column="ip" {root}>IP</Table.Header.Cell>
            <Table.Header.Cell column="actions" {root} />
        </svelte:fragment>
        {#each data.sessions.sessions as session}
            {@const browser = getBrowser(session.clientCode)}
            <Table.Row.Base {root}>
                <Table.Cell column="client" {root}>
                    <Layout.Stack direction="row" alignItems="center">
                        {#if session.clientName}
                            <div class="avatar is-size-small">
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
                                        aria-hidden="true"></span>
                                {/if}
                            </div>
                            <Trim>
                                {session.clientName}
                                {session.clientVersion}
                                on {session.osName}
                                {session.osVersion}
                            </Trim>
                        {:else}
                            <span class="avatar is-color-empty"></span>
                            <p class="text u-trim">Unknown</p>
                        {/if}
                        <div class="is-only-desktop">
                            <Badge variant="secondary" content={session.provider} />
                        </div>
                        {#if session.current}
                            <Badge type="success" variant="secondary" content="current session" />
                        {/if}
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell column="location" {root}>
                    {#if session.countryCode !== '--'}
                        {session.countryName}
                    {:else}
                        Unknown
                    {/if}
                </Table.Cell>
                <Table.Cell column="ip" {root}>
                    {session.ip}
                </Table.Cell>
                <Table.Cell column="actions" {root}>
                    <Button size="xs" secondary on:click={() => logout(session)}>Sign out</Button>
                </Table.Cell>
            </Table.Row.Base>
        {/each}
    </Table.Root>
</Container>
