<script lang="ts">
    import { page as pageStore } from '$app/stores';
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
    import {
        Badge,
        Layout,
        Table,
        Typography,
        Icon,
        InteractiveText
    } from '@appwrite.io/pink-svelte';
    import { IconGlobeAlt, IconTerminal } from '@appwrite.io/pink-icons-svelte';
    import { toLocaleDate } from '$lib/helpers/date';

    export let data: PageData;

    // Apps the user authorized through the console OAuth2 server (e.g. the
    // Appwrite CLI via the device flow) are stored as identities with an
    // `oauth2:<appId>` provider, separately from browser sessions.
    $: connectedApps = data.identities.identities.filter((identity) =>
        identity.provider?.startsWith('oauth2:')
    );

    // The built-in CLI client only supports the device flow, so we can label it
    // precisely; other OAuth2 clients just show "OAuth".
    const OAUTH2_PREFIX = 'oauth2:';
    const KNOWN_APP_NAMES: Record<string, string> = {
        'appwrite-cli': 'Appwrite CLI'
    };

    function appIdOf(provider: string): string {
        return provider.slice(OAUTH2_PREFIX.length);
    }

    function appName(provider: string): string {
        const appId = appIdOf(provider);
        return KNOWN_APP_NAMES[appId] ?? appId;
    }

    function connectionLabel(provider: string): string {
        return appIdOf(provider) === 'appwrite-cli' ? 'OAuth · device flow' : 'OAuth';
    }

    function getBrowser(clientCode: string) {
        const code = clientCode.toLowerCase();
        if (!isValueOfStringEnum(Browser, code)) return '';

        return sdk.forConsole.avatars.getBrowser({ code, width: 40, height: 40 });
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
            result = await sdk.forConsole.account.deleteSession({
                sessionId: session.$id
            });
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

    async function revokeApp(identity: Models.Identity) {
        try {
            await sdk.forConsole.account.deleteIdentity({ identityId: identity.$id });
            await invalidate(Dependencies.ACCOUNT_SESSIONS);
            trackEvent(Submit.AccountDeleteIdentity);
            addNotification({
                type: 'success',
                message: `Access for ${appName(identity.provider)} has been revoked`
            });
        } catch (e) {
            addNotification({ type: 'error', message: e.message });
        }
    }

    onMount(() => {
        return pageStore.subscribe(($page) => {
            const url = new URL($page.url);
            const sessionId = url.searchParams.get('sessionId');
            if (sessionId) {
                logoutSessionId(sessionId);

                // Clear the sessionId param from the URL
                url.searchParams.delete('sessionId');
                goto(url.pathname + url.search, { replaceState: true });
            }
        });
    });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Typography.Title>Sessions</Typography.Title>
        <Button secondary on:click={logoutAll}>Sign out all sessions</Button>
    </Layout.Stack>

    <Table.Root
        class="responsive-table"
        let:root
        columns={[
            { id: 'client', width: { min: 450 } },
            { id: 'location', width: { min: 200 } },
            { id: 'ip', width: { min: 330 } },
            { id: 'actions', width: 100 }
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
                                        alt={session.clientName} />
                                {:else}
                                    <Icon icon={IconGlobeAlt} size="s" />
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
                    <InteractiveText variant="copy" text={session.ip} isVisible />
                </Table.Cell>
                <Table.Cell column="actions" {root}>
                    <Button size="xs" secondary on:click={() => logout(session)}>Sign out</Button>
                </Table.Cell>
            </Table.Row.Base>
        {/each}
    </Table.Root>

    {#if connectedApps.length > 0}
        <Layout.Stack gap="xxs">
            <Typography.Title size="s">Connected applications</Typography.Title>
            <Typography.Text variant="m-400" color="--fgcolor-neutral-secondary">
                Applications you've authorized to access your account.
            </Typography.Text>
        </Layout.Stack>

        <Table.Root
            class="responsive-table"
            let:root
            columns={[
                { id: 'app', width: { min: 450 } },
                { id: 'authorized', width: { min: 200 } },
                { id: 'actions', width: 100 }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="app" {root}>Application</Table.Header.Cell>
                <Table.Header.Cell column="authorized" {root}>Authorized</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            </svelte:fragment>
            {#each connectedApps as identity (identity.$id)}
                <Table.Row.Base {root}>
                    <Table.Cell column="app" {root}>
                        <Layout.Stack direction="row" alignItems="center">
                            <div class="avatar is-size-small">
                                <Icon icon={IconTerminal} size="s" />
                            </div>
                            <Trim>{appName(identity.provider)}</Trim>
                            <Badge
                                variant="secondary"
                                content={connectionLabel(identity.provider)} />
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell column="authorized" {root}>
                        {toLocaleDate(identity.$createdAt)}
                    </Table.Cell>
                    <Table.Cell column="actions" {root}>
                        <Button size="xs" secondary on:click={() => revokeApp(identity)}>
                            Revoke
                        </Button>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    {/if}
</Container>
