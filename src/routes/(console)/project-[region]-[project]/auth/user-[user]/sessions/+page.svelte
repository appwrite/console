<script lang="ts">
    import { EmptySearch, Trim } from '$lib/components';
    import { Badge, Layout, Table, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { IconGlobeAlt } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { Browser } from '@appwrite.io/console';
    import DeleteAllSessions from '../deleteAllSessions.svelte';
    import DeleteSessions from '../deleteSession.svelte';

    export let data;

    let showDelete = false;
    let showDeleteAll = false;
    let selectedSessionId: string;

    function getBrowser(clientCode: string) {
        const code = clientCode.toLowerCase();
        if (!isValueOfStringEnum(Browser, code)) return '';

        return sdk.forConsole.avatars.getBrowser({ code, width: 40, height: 40 });
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Typography.Title>Sessions</Typography.Title>
        {#if data.sessions.total}
            <Button secondary on:click={() => (showDeleteAll = true)}>Sign out all sessions</Button>
        {/if}
    </Layout.Stack>

    {#if data.sessions.total}
        <Table.Root
            let:root
            columns={[
                { id: 'client' },
                { id: 'location', width: 200 },
                { id: 'ip', width: 200 },
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
                                {session.clientVersion} on {session.osName}
                                {session.osVersion}
                            </Trim>
                            {#if session.current}
                                <Badge
                                    type="success"
                                    variant="secondary"
                                    content="current session" />
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
                        <Button
                            size="xs"
                            secondary
                            on:click={() => {
                                selectedSessionId = session.$id;
                                showDelete = true;
                            }}>
                            Sign out
                        </Button>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    {:else}
        <EmptySearch>
            <div class="u-flex u-flex-vertical u-cross-center u-gap-24">
                <p class="text u-line-height-1-5">No sessions available</p>
                <Button
                    external
                    secondary
                    href="https://appwrite.io/docs/products/auth/email-password">
                    Documentation
                </Button>
            </div>
        </EmptySearch>
    {/if}
</Container>

<DeleteSessions {selectedSessionId} bind:showDelete />
<DeleteAllSessions bind:showDeleteAll />
