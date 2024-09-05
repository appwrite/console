<script lang="ts">
    import { Card, CustomId, DropList, DropListItem, Modal } from '$lib/components';
    import { Button, FormList, Helper, InputText } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import type { PageData } from './$types';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { Pill } from '$lib/elements';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { ID, type Models } from '@appwrite.io/console';
    import { page } from '$app/stores';

    export let data: PageData;
    const databaseId = $page.params.database;

    let showDelete = false;
    let selectedBackup: Models.BackupArchive = null;

    let showDropdown = [];

    let error = null;
    let showRestore = false;
    let showCustomId = false;
    let newDatabaseInfo: { name: string; id: string } = { name: null, id: null };

    const deleteBackup = async () => {
        try {
            await sdk.forProject.backups.deleteArchive(selectedBackup.$id);
            addNotification({
                type: 'success',
                message: 'Backup delete'
            });

            invalidate(Dependencies.BACKUPS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            showDelete = false;
        }
    };

    const restoreBackup = async () => {
        if (newDatabaseInfo.id === databaseId) {
            error = 'Database ID must be different from the one being restored';
            return;
        }

        try {
            await sdk.forProject.backups.createRestoration(
                selectedBackup.$id,
                ['databases'],
                newDatabaseInfo.id ?? ID.unique(),
                newDatabaseInfo.name
            );
            addNotification({
                type: 'success',
                message: 'Backup restore initiated'
            });

            invalidate(Dependencies.BACKUPS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            showRestore = false;
        }
    };

    $: cleanBackupName = (backup: Models.BackupArchive) =>
        toLocaleDateTime(backup.$createdAt).replaceAll(',', '');
</script>

<TableScroll>
    <TableHeader>
        <TableCellHead width={180}>Backups</TableCellHead>
        <TableCellHead width={176}>Size</TableCellHead>
        <TableCellHead width={178}>Size</TableCellHead>
        <TableCellHead width={176}>Policy</TableCellHead>
    </TableHeader>
    <TableBody>
        {#each data.backups.archives as backup, index}
            <TableRow>
                <TableCell width={180} title={backup.$createdAt}>
                    {cleanBackupName(backup)}
                </TableCell>
                <TableCell width={164} title="Backup Size">
                    {#if backup.status === 'completed'}
                        {calculateSize(backup.size)}
                    {:else}
                        -
                    {/if}
                </TableCell>
                <TableCell width={163} title="Backup Status">
                    <div class="u-flex u-gap-8 u-cross-baseline">
                        <Pill
                            warning={backup.status === 'pending'}
                            danger={backup.status === 'failed'}
                            success={backup.status === 'completed'}>
                            {backup.status.toLowerCase()}
                        </Pill>
                        <!--{#if backup.status === 'Failed'}-->
                        <!--    <span class="u-underline">Get support</span>-->
                        <!--{/if}-->
                    </div>
                </TableCell>
                <TableCell width={163} title="Backup Policy">
                    <div class="u-flex u-main-space-between u-cross-baseline">
                        {backup.policyId ? backup.policyId : 'Manual'}
                        <DropList bind:show={showDropdown[index]} placement="bottom-end">
                            <button
                                class="button is-only-icon is-text"
                                aria-label="More options"
                                on:click|preventDefault={() => {
                                    showDropdown[index] = !showDropdown[index];
                                }}>
                                <span class="icon-dots-horizontal" aria-hidden="true" />
                            </button>

                            <svelte:fragment slot="list">
                                <DropListItem
                                    on:click={() => {
                                        showRestore = true;
                                        selectedBackup = backup;
                                        showDropdown[index] = false;
                                    }}>
                                    Restore
                                </DropListItem>
                                <DropListItem
                                    on:click={() => {
                                        showDelete = true;
                                        selectedBackup = backup;
                                        showDropdown[index] = false;
                                    }}>
                                    Delete
                                </DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </div>
                </TableCell>
            </TableRow>
        {/each}
    </TableBody>
</TableScroll>

<Modal
    title="Delete backup"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    headerDivider={false}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{cleanBackupName(selectedBackup)}</b>?
        <br />This action is irreversible.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary on:click={deleteBackup}>Delete</Button>
    </svelte:fragment>
</Modal>

<Modal title="Restore backup" bind:show={showRestore}>
    <p class="text" data-private>
        Restoring this backup will duplicate the database from the selected backup version. This
        action may take a while.
    </p>

    <Card isTile style="border-radius: var(--border-radius-small, 8px); padding: 1rem;">
        <div class="u-flex u-flex-vertical u-gap-4">
            <span class="body-text-2 u-bold darker-neutral-color">
                {cleanBackupName(selectedBackup)}
            </span>
            <div class="u-flex u-cross-center u-gap-6">
                <span>
                    <span class="u-color-text-success u-font-size-12">●</span> Completed
                </span>
                <span class="small-ellipse">●</span>
                {calculateSize(selectedBackup.size)}
                <span class="small-ellipse">●</span>
                Created {timeFromNow(selectedBackup.$createdAt)}
            </div>
        </div>
    </Card>

    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="Enter database name"
            bind:value={newDatabaseInfo.name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Database ID
                    </span></Pill>
            </div>
        {:else}
            <div class="u-flex u-flex-vertical u-gap-8">
                <CustomId
                    bind:show={showCustomId}
                    name="Database"
                    bind:id={newDatabaseInfo.id}
                    autofocus={false} />

                {#if error}
                    <Helper type="warning">{error}</Helper>
                {/if}
            </div>
        {/if}
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRestore = false)}>Cancel</Button>
        <Button submit on:click={restoreBackup}>Restore</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .icon-dots-horizontal {
        font-size: 1.5rem;
    }
</style>
