<script lang="ts">
    import { EmptySearch } from '$lib/components';
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
    import { Container, ContainerHeader } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { Browser } from '@appwrite.io/console';
    import DeleteAllSessions from '../deleteAllSessions.svelte';
    import DeleteSessions from '../deleteSession.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let showDelete = false;
    let showDeleteAll = false;
    let selectedSessionId: string;

    function getBrowser(clientCode: string) {
        const code = clientCode.toLowerCase();
        if (!isValueOfStringEnum(Browser, code)) return '';

        return sdk.forConsole.avatars.getBrowser(code, 40, 40);
    }
</script>

<Container>
    <ContainerHeader title="Sessions">
        {#if data.sessions.total}
            <Button secondary on:click={() => (showDeleteAll = true)}>
                <span class="text">Delete All</span>
            </Button>
        {/if}
    </ContainerHeader>
    {#if data.sessions.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={140}>Browser and device</TableCellHead>
                <TableCellHead width={140}>Session</TableCellHead>
                <TableCellHead width={140}>Location</TableCellHead>
                <TableCellHead width={140}>IP</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.sessions.sessions as session}
                    {@const browser = getBrowser(session.clientCode)}
                    <TableRow>
                        <TableCell title="Client">
                            <div class="u-flex u-gap-12 u-cross-center">
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
                        <TableCell>
                            <Button
                                text
                                round
                                ariaLabel="Delete item"
                                on:click={() => {
                                    selectedSessionId = session.$id;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </Button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>
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
