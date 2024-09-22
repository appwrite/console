<script lang="ts">
    import { Card, DropList, DropListItem, Modal } from '$lib/components';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { tooltip } from '$lib/actions/tooltip';
    import RestoreModal from './restoreModal.svelte';
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

    let showRestore = false;
    let showCustomId = false;
    let newDatabaseInfo: { name: string; id: string } = { name: null, id: null };

    const deleteBackup = async () => {
        try {
            await sdk.forProject.backups.deleteArchive(selectedBackup.$id);
            addNotification({
                type: 'success',
                message: 'Backup deleted'
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
        try {
            await sdk.forProject.backups.createRestoration(
                selectedBackup.$id,
                ['databases'],
                newDatabaseInfo.id ?? ID.unique(),
                newDatabaseInfo.name
            );
            addNotification({
                type: 'success',
                message: 'Database restore initiated'
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

    const policyDetails = (policyId: string | null) =>
        data.policies.policies.find((policy) => policy.$id === policyId);

    const cleanBackupName = (backup: Models.BackupArchive) =>
        toLocaleDateTime(backup.$createdAt).replaceAll(',', '');
</script>

<TableScroll isSticky class="custom-height-table-column">
    <TableHeader>
        <TableCellHead width={192}>Backups</TableCellHead>
        <TableCellHead width={120}>Size</TableCellHead>
        <TableCellHead width={120}>Status</TableCellHead>
        <TableCellHead width={120}>Policy</TableCellHead>
        <TableCellHead width={48} />
    </TableHeader>
    <TableBody>
        {#each data.backups.archives as backup, index}
            {@const policy = policyDetails(backup.policyId)}
            {@const retainedUntil = new Date(
                new Date(policy?.$createdAt).getTime() + policy?.retention * 24 * 60 * 60 * 1000
            )}
            <TableRow>
                <TableCell width={192} title={backup.$createdAt}>
                    {cleanBackupName(backup)}
                </TableCell>
                <TableCell width={120} title="Backup Size">
                    {#if backup.status === 'completed'}
                        {calculateSize(backup.size)}
                    {:else}
                        -
                    {/if}
                </TableCell>
                <TableCell width={120} title="Backup Status">
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
                <TableCell width={168} title="Backup Policy">
                    <div class="u-flex u-main-space-between u-cross-baseline">
                        <span
                            use:tooltip={{
                                content: policy
                                    ? `Retained until: ${retainedUntil}`
                                    : `Retained forever`
                            }}>
                            {policy?.name || 'Manual'}
                        </span>
                    </div>
                </TableCell>

                <TableCell width={48}>
                    <div class="u-flex u-cross-center">
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
                                {#if backup.status === 'completed'}
                                    <DropListItem
                                        on:click={() => {
                                            showRestore = true;
                                            selectedBackup = backup;
                                            showDropdown[index] = false;
                                        }}>
                                        Restore
                                    </DropListItem>
                                {/if}
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
    headerDivider={false}
    onSubmit={deleteBackup}>
    <p class="text" data-private>
        Are you sure you want to delete <b>{cleanBackupName(selectedBackup)}</b>?
        <br />This action is irreversible.
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>

<Modal title="Restore backup" bind:show={showRestore} onSubmit={restoreBackup}>
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
                <RestoreModal
                    bind:show={showCustomId}
                    name="Database"
                    {databaseId}
                    bind:id={newDatabaseInfo.id}
                    autofocus={false} />
            </div>
        {/if}
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRestore = false)}>Cancel</Button>
        <Button submit>Restore</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .icon-dots-horizontal {
        font-size: 1.5rem;
    }

    :global(.custom-height-table-column .table-col) {
        height: 54px;
    }
</style>
