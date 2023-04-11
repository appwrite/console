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
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import Heading from '$lib/components/heading.svelte';
    import Create from './create.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Delete from './delete.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { createEventDispatcher } from 'svelte';

    export let data: PageData;

    let showCreate = false;
    let showDelete = false;
    let selectedBackup: Models.Backup;

    const projectId = $project.$id;

    const dispatch = createEventDispatcher();

    async function handleCreate() {
        showCreate = false;
    }

    async function handleRestore(backup: Models.Backup) {
        try {
            const restore = await sdkForConsole.projects.restoreBackup(projectId, backup.$id);
            dispatch('created', restore);
            addNotification({
                type: 'success',
                message: `${backup.name} is being restored.`
            });
            trackEvent(Submit.BackupRestore, {
                customId: !!backup.$id
            });
            await invalidate(Dependencies.BACKUPS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BackupRestore);
        }
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
                    <TableRow>
                        <TableCell title="Name">
                            <div class="u-flex u-main-space-between">
                                {backup.name}
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
                            <Button
                                on:click={async () => {
                                    showDelete = true;
                                    selectedBackup = backup;
                                }}
                                secondary>Delete</Button>
                        </TableCellText>
                        <TableCellText title="Restore">
                            <Button on:click={async () => handleRestore(backup)} secondary
                                >Restore</Button>
                        </TableCellText>
                    </TableRow>
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
<Delete bind:showDelete bind:selectedBackup />
