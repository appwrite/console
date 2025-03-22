<script lang="ts">
    import { Card, DropList, DropListItem, FloatingActionBar, Modal } from '$lib/components';
    import { Button, FormList, InputCheckbox, InputText } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellCheck,
        TableCellHead,
        TableCellHeadCheck,
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
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { ID } from '@appwrite.io/console';
    import { database } from '../store';
    import type { BackupArchive } from '$lib/sdk/backups';
    import { trackEvent } from '$lib/actions/analytics';
    import { copy } from '$lib/helpers/copy';
    import { LabelCard } from '$lib/components/index.js';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';

    export let data: PageData;

    let showDelete = false;
    let selectedBackup: BackupArchive = null;

    let showDropdown = [];
    let selectedBackups: string[] = [];

    let showRestore = false;
    let showCustomId = false;
    let newDatabaseInfo: { name: string; id: string } = { name: null, id: null };

    let confirmSameDbRestore = false;
    let selectedRestoreOption = 'new';
    let restoreOptions = [
        {
            id: 'new',
            title: 'Restore in new database',
            description:
                'Duplicate the database from the selected backup version into a new database.'
        },
        {
            id: 'same',
            title: 'Restore in current database',
            description: 'Overwrite the current database with the selected backup version.'
        }
    ];

    const deleteBackups = async () => {
        if (!selectedBackups.length && selectedBackup) {
            selectedBackups.push(selectedBackup.$id);
        }

        const message = `${selectedBackups.length} backup${selectedBackups.length > 1 ? 's have been' : ''} deleted`;

        const promises = selectedBackups.map((archiveId) =>
            sdk
                .forProject($page.params.region, $page.params.project)
                .backups.deleteArchive(archiveId)
        );

        try {
            await Promise.all(promises);
            addNotification({
                message,
                type: 'success'
            });
            invalidate(Dependencies.BACKUPS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            showDelete = false;
            selectedBackup = null;
            selectedBackups = [];
        }
    };

    const restoreBackup = async () => {
        if (selectedRestoreOption === 'same') {
            newDatabaseInfo.id = $database.$id;
            newDatabaseInfo.name = $database.name;
        }

        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .backups.createRestoration(
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
            trackEvent('backup_restore_submit', {
                newDatabaseName: newDatabaseInfo.name
            });
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

    const cleanBackupName = (backup: BackupArchive) =>
        toLocaleDateTime(backup.$createdAt).replaceAll(',', '');

    $: if (!showRestore && !showDelete) {
        showCustomId = false;
        selectedBackup = null;

        confirmSameDbRestore = false;
        selectedRestoreOption = 'new';
        newDatabaseInfo = { name: null, id: null };
    }
</script>

<TableScroll class="custom-height-table-column">
    <TableHeader>
        <TableCellHeadCheck
            bind:selected={selectedBackups}
            pageItemsIds={data.backups.archives.map((b) => b.$id)} />
        <TableCellHead width={192}>Backups</TableCellHead>
        <TableCellHead width={80}>Size</TableCellHead>
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
            {@const formattedRetainedUntil = `${retainedUntil.getDate()} ${retainedUntil.toLocaleString('en-US', { month: 'short' })}, ${retainedUntil.getFullYear()} ${retainedUntil.toLocaleTimeString('en-US', { hour12: false })}`}
            <TableRow>
                <TableCellCheck id={backup.$id} bind:selectedIds={selectedBackups} />
                <TableCell title={backup.$createdAt}>
                    <span
                        use:tooltip={{
                            content: timeFromNow(backup.$createdAt)
                        }}>
                        {cleanBackupName(backup)}
                    </span>
                </TableCell>
                <TableCell title="Backup Size">
                    {#if backup.status === 'completed'}
                        {calculateSize(backup.size)}
                    {:else}
                        -
                    {/if}
                </TableCell>
                <TableCell title="Backup Status">
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
                <TableCell title="Backup Policy">
                    <div class="u-flex u-main-space-between u-cross-baseline">
                        <span
                            use:tooltip={{
                                content: policy
                                    ? `Retained until: ${formattedRetainedUntil}`
                                    : `Retained forever`
                            }}>
                            {policy?.name || 'Manual'}
                        </span>
                    </div>
                </TableCell>

                <TableCell class="last-dropdown-item">
                    <DropList
                        class="drop-list-menu"
                        noArrow
                        bind:show={showDropdown[index]}
                        placement="bottom-end">
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
                                    icon="refresh"
                                    on:click={() => {
                                        showRestore = true;
                                        selectedBackup = backup;
                                        showDropdown[index] = false;
                                        trackEvent('click_backup_restore');
                                    }}>
                                    Restore
                                </DropListItem>
                            {/if}
                            <DropListItem
                                icon="trash"
                                on:click={() => {
                                    showDelete = true;
                                    selectedBackup = backup;
                                    showDropdown[index] = false;
                                    trackEvent('click_backup_delete');
                                }}>
                                Delete
                            </DropListItem>

                            <DropListItem
                                icon="duplicate"
                                on:click={() => {
                                    copy(backup.$id);
                                    showDropdown[index] = false;
                                }}>
                                Copy ID
                            </DropListItem>
                        </svelte:fragment>
                    </DropList>
                </TableCell>
            </TableRow>
        {/each}
    </TableBody>
</TableScroll>

<FloatingActionBar show={selectedBackups.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selectedBackups.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selectedBackups.length > 1 ? 'backups' : 'backup'}
                </span>
                selected
            </p>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selectedBackups = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </Button>
        </div>
    </div>
</FloatingActionBar>

<Modal
    title="Delete {selectedBackups.length ? 'backups' : 'backup'}"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    headerDivider={false}
    onSubmit={deleteBackups}>
    <p class="text" data-private>
        Are you sure you want to delete
        {#if selectedBackups.length}
            <b>{selectedBackups.length}</b> {selectedBackups.length > 1 ? 'backups' : 'backup'}?
        {:else}
            the <b>{cleanBackupName(selectedBackup)}</b> backup?
        {/if}
        <br />This action is irreversible.
    </p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>

<Modal headerDivider={true} title="Restore backup" bind:show={showRestore} onSubmit={restoreBackup}>
    <Card
        isTile
        class="restore-modal-inner-card u-width-full-line"
        style="border-radius: var(--border-radius-small, 8px); padding: 1rem;">
        <div class="u-flex u-flex-vertical u-gap-4">
            <span class="body-text-2 u-bold darker-neutral-color">
                {cleanBackupName(selectedBackup)}
            </span>
            <div class="u-flex u-cross-center u-gap-6 u-width-full-line">
                <span class="u-flex u-cross-center u-gap-4">
                    <span class="u-color-text-success u-font-size-12">●</span> Completed
                </span>
                <span class="small-ellipse">●</span>
                {calculateSize(selectedBackup.size)}
                <span class="small-ellipse">●</span>

                <!--                TODO: ellipsis-->
                {timeFromNow(selectedBackup.$createdAt)}
            </div>
        </div>
    </Card>

    <FormList>
        <div class="u-flex u-flex-vertical-mobile u-gap-16">
            {#each restoreOptions as restoreOption}
                <div class="u-width-full-line">
                    <LabelCard
                        padding={1}
                        name="restore"
                        value={restoreOption.id}
                        bind:group={selectedRestoreOption}>
                        <svelte:fragment slot="custom">
                            <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                                <h4 class="body-text-2 u-bold">
                                    {restoreOption.title}
                                </h4>
                                <p class="u-color-text-offline u-small">
                                    {restoreOption.description}
                                </p>
                            </div>
                        </svelte:fragment>
                    </LabelCard>
                </div>
            {/each}
        </div>

        {#if selectedRestoreOption === 'new'}
            <div class="u-flex-vertical u-gap-8">
                <InputText
                    id="name"
                    label="Database name"
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
                            autofocus={false}
                            name="Database"
                            bind:show={showCustomId}
                            databaseId={$database.$id}
                            bind:id={newDatabaseInfo.id} />
                    </div>
                {/if}
            </div>
        {:else}
            <div class="input-check-box-friction">
                <InputCheckbox
                    required
                    size="small"
                    id="delete_policy"
                    bind:checked={confirmSameDbRestore}>
                    <svelte:fragment slot="description">
                        <span style="margin-block-start: 1px;">
                            Overwrite <b>{$database.name}</b> with the selected backup version
                        </span>
                    </svelte:fragment>
                </InputCheckbox>
            </div>
        {/if}
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRestore = false)}>Cancel</Button>
        <Button submit>Restore</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    :global(.custom-height-table-column .table-col) {
        height: 54px;
        padding: 0 1rem; /* removes vertical padding for constrained height */
    }

    :global(.restore-modal-inner-card) {
        background: hsl(var(--color-neutral-5));
        border: 1px solid hsl(var(--color-neutral-10));
    }

    :global(.theme-dark .restore-modal-inner-card) {
        background: hsl(var(--color-neutral-85));
        border: 1px solid hsl(var(--color-neutral-80));
    }

    // centers item horizontally!
    :global(.last-dropdown-item div) {
        margin: auto;
    }

    .actions {
        .indicator {
            border-radius: 0.25rem;
            background: hsl(var(--color-information-100));
            color: hsl(var(--color-neutral-0));

            padding: 0rem 0.375rem;
            display: inline-block;
        }
    }
</style>
