<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { Browser } from '@appwrite.io/console';
    import DeleteAllSessions from '../deleteAllSessions.svelte';
    import DeleteSessions from '../deleteSession.svelte';
    import type { PageData } from './$types';
    import { Badge, Card, Empty, Layout, Table } from '@appwrite.io/pink-svelte';
    import { consoleProfile, isStudio } from '$lib/system';

    export let data: PageData;

    function getBrowser(clientCode: string) {
        const code = clientCode.toLowerCase();
        if (!isValueOfStringEnum(Browser, code)) return '';
        return sdk.forProject.avatars.getBrowser(code, 40, 40);
    }

    let showDelete = false;
    let showDeleteAll = false;
    let selectedSessionId: string;
</script>

<Container>
    {#if data.sessions.total}
        <Layout.Stack alignItems="flex-end">
            <Button secondary on:click={() => (showDeleteAll = true)}>
                <span class="text">Delete All</span>
            </Button>
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
                                <p class="text">
                                    {session.clientName}
                                    {session.clientVersion} on {session.osName}
                                    {session.osVersion}
                                </p>
                            {:else}
                                <span class="avatar is-color-empty"></span>
                                <p class="text u-trim">Unknown</p>
                            {/if}
                            <Badge variant="secondary" content={session.provider} />
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
                            compact
                            icon
                            ariaLabel="Delete item"
                            on:click={() => {
                                selectedSessionId = session.$id;
                                showDelete = true;
                            }}>
                            <span class="icon-trash" aria-hidden="true"></span>
                        </Button>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    {:else}
        <Card.Base padding="none">
            <Empty
                title="No sessions available"
                description={!consoleProfile.hasAppwriteDocumentation
                    ? ''
                    : 'Need a hand? Learn more in our documentation.'}
                type="secondary">
                <svelte:fragment slot="actions">
                    {#if consoleProfile.hasAppwriteDocumentation}
                        <Button
                            external
                            secondary
                            href="https://appwrite.io/docs/products/auth/email-password">
                            Documentation
                        </Button>
                    {/if}
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>

<DeleteSessions {selectedSessionId} bind:showDelete />
<DeleteAllSessions bind:showDeleteAll />
