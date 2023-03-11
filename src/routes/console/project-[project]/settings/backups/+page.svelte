<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, Status } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableHeader
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import Heading from '$lib/components/heading.svelte';
    import Create from './create.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';

    export let data: PageData;

    let showCreate = false;

    async function handleCreate() {
        showCreate = false;
    }

    console.log(data.backups);
</script>

<svelte:head>
    <title>Backups - Appwrite</title>
</svelte:head>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Backups</Heading>
        <Button on:click={() => (showCreate = true)} event="create_backup">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create Backup</span>
        </Button>
    </div>

    {#if data.backups.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Created</TableCellHead>
                <TableCellHead width={80}>Status</TableCellHead>
                <TableCellHead>Delete</TableCellHead>
                <TableCellHead>Restore</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.backups.backups as backup}
                    <TableCell title="Name">
                        <div class="u-flex u-main-space-between">
                            {backup.name}
                            <!-- {#if webhook.security === false}
                                <Pill>SLL/TLS disabled</Pill>
                            {/if} -->
                        </div>
                    </TableCell>
                    <TableCellText title="Created"
                        >{toLocaleDateTime(backup.$createdAt)}</TableCellText>
                    <TableCellText title="Status">
                        <Status status={backup.status}>
                            {backup.status}
                        </Status>
                    </TableCellText>
                    <TableCellText title="Delete">
                        <Button secondary>Delete</Button>
                    </TableCellText>
                    <TableCellText title="Restore">
                        <Button secondary>Restore</Button>
                    </TableCellText>
                {/each}
            </TableBody>
        </Table>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/backups"
            target="backup"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={handleCreate} />
