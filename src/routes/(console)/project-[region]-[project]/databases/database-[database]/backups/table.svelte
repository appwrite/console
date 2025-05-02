<script lang="ts">
    import { Card, Modal } from '$lib/components';
    import { Button, InputCheckbox, InputText } from '$lib/elements/forms';
    import RestoreModal from './restoreModal.svelte';
    import type { PageData } from './$types';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { ID } from '@appwrite.io/console';
    import { columns } from './store';
    import { database } from '../store';
    import type { BackupArchive } from '$lib/sdk/backups';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { copy } from '$lib/helpers/copy';
    import { LabelCard } from '$lib/components/index.js';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    import { Dependencies } from '$lib/constants';
    import {
        ActionMenu,
        Badge,
        FloatingActionBar,
        Icon,
        Layout,
        Popover,
        Status,
        Table,
        Tag,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconDuplicate,
        IconPencil,
        IconRefresh,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { capitalize } from '$lib/helpers/string';
    import Ellipse from './components/Ellipse.svelte';
    import Confirm from '$lib/components/confirm.svelte';
    import { page } from '$app/state';

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
            description: 'Duplicate the database from the selected backup version to a new.'
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
            sdk.forProject(page.params.region, page.params.project).backups.deleteArchive(archiveId)
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
                .forProject(page.params.region, page.params.project)
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

    $: disableButton =
        (selectedRestoreOption === 'new' &&
            (!newDatabaseInfo.name || $database.$id === newDatabaseInfo.id)) ||
        (selectedRestoreOption === 'same' && !confirmSameDbRestore);

    function getBackupStatus(backup: BackupArchive) {
        switch (backup.status) {
            case 'pending':
                return 'pending';
            case 'completed':
                return 'complete';
            case 'uploading':
            case 'downloading':
                return 'processing';
            case 'failed':
                return 'failed';
            default:
                return 'waiting';
        }
    }
</script>

<Table.Root let:root allowSelection columns={$columns} bind:selectedRows={selectedBackups}>
    <svelte:fragment slot="header" let:root>
        {#each $columns as column}
            <Table.Header.Cell column={column.id} {root}>{column.title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>

    {#each data.backups.archives as backup, index}
        {@const policy = policyDetails(backup.policyId)}
        {@const retainedUntil = new Date(
            new Date(policy?.$createdAt).getTime() + policy?.retention * 24 * 60 * 60 * 1000
        )}
        {@const formattedRetainedUntil = `${retainedUntil.getDate()} ${retainedUntil.toLocaleString('en-US', { month: 'short' })}, ${retainedUntil.getFullYear()} ${retainedUntil.toLocaleTimeString('en-US', { hour12: false })}`}
        <Table.Row.Base id={backup.$id} {root}>
            <Table.Cell column="backups" {root}>
                <DualTimeView time={backup.$createdAt}>
                    {cleanBackupName(backup)}
                </DualTimeView>
            </Table.Cell>
            <Table.Cell column="size" {root}>
                {#if backup.status === 'completed'}
                    {calculateSize(backup.size)}
                {:else}
                    -
                {/if}
            </Table.Cell>
            <Table.Cell column="status" {root}>
                {@const backupStatus = getBackupStatus(backup)}
                <Status status={backupStatus} label={capitalize(backupStatus)} />
                <!--{#if backup.status === 'Failed'}-->
                <!--    <span class="u-underline">Get support</span>-->
                <!--{/if}-->
            </Table.Cell>
            <Table.Cell column="policy" {root}>
                <div class="u-flex u-main-space-between u-cross-baseline">
                    <Tooltip maxWidth="fit-content">
                        <span>
                            {policy?.name || 'Manual'}
                        </span>
                        <span slot="tooltip"
                            >{policy
                                ? `Retained until: ${formattedRetainedUntil}`
                                : `Retained forever`}</span>
                    </Tooltip>
                </div>
            </Table.Cell>
            <Table.Cell column="action" {root}>
                <Popover let:toggle padding="m" placement="bottom-end">
                    <Button extraCompact on:click={toggle}>
                        <Icon icon={IconDotsHorizontal} />
                    </Button>
                    <svelte:fragment slot="tooltip" let:toggle>
                        <ActionMenu.Root width="180px" noPadding>
                            {#if backup.status === 'completed'}
                                <ActionMenu.Item.Button
                                    trailingIcon={IconRefresh}
                                    on:click={(e) => {
                                        toggle(e);
                                        showRestore = true;
                                        selectedBackup = backup;
                                        showDropdown[index] = false;
                                        trackEvent(Click.BackupRestoreClick);
                                    }}>
                                    Restore
                                </ActionMenu.Item.Button>
                            {/if}
                            <ActionMenu.Item.Button
                                trailingIcon={IconDuplicate}
                                on:click={(e) => {
                                    toggle(e);
                                    copy(backup.$id);
                                    showDropdown[index] = false;
                                    trackEvent(Click.BackupCopyIdClick);
                                }}>
                                Copy ID
                            </ActionMenu.Item.Button>
                            <ActionMenu.Item.Button
                                status="danger"
                                trailingIcon={IconTrash}
                                on:click={(e) => {
                                    toggle(e);
                                    showDelete = true;
                                    selectedBackup = backup;
                                    showDropdown[index] = false;
                                    trackEvent(Click.BackupDeleteClick);
                                }}>
                                Delete
                            </ActionMenu.Item.Button>
                        </ActionMenu.Root>
                    </svelte:fragment>
                </Popover>
            </Table.Cell>
        </Table.Row.Base>
    {/each}
</Table.Root>

{#if selectedBackups.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedBackups.length.toString()} />
            <span>
                {selectedBackups.length > 1 ? 'backups' : 'backup'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedBackups = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm
    title="Delete {selectedBackups.length ? 'backups' : 'backup'}"
    bind:open={showDelete}
    onSubmit={deleteBackups}>
    <Typography.Text>
        Are you sure you want to delete
        {#if selectedBackups.length}
            <b>{selectedBackups.length}</b> {selectedBackups.length > 1 ? 'backups' : 'backup'}?
        {:else}
            the <b>{cleanBackupName(selectedBackup)}</b> backup?
        {/if}
        <br />This action is irreversible.
    </Typography.Text>
</Confirm>

<Modal title="Restore backup" bind:show={showRestore} onSubmit={restoreBackup}>
    <Card radius="m" padding="s">
        <Layout.Stack gap="xxs">
            <Typography.Text variant="m-500">
                {cleanBackupName(selectedBackup)}
            </Typography.Text>

            <Typography.Caption variant="500">
                <Layout.Stack direction="row" gap="xs">
                    <Ellipse color="var(--bgcolor-success)" /> Completed
                    <Ellipse size="s" />
                    {calculateSize(selectedBackup.size)}
                    <Ellipse size="s" />
                    {timeFromNow(selectedBackup.$createdAt)}
                </Layout.Stack>
            </Typography.Caption>
        </Layout.Stack>
    </Card>

    <Layout.Stack direction="row" gap="l">
        {#each restoreOptions as restoreOption}
            <div class="u-width-full-line">
                <LabelCard padding="s" value={restoreOption.id} bind:group={selectedRestoreOption}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                            <h4 class="body-text-2 u-bold">
                                {restoreOption.title}
                            </h4>
                        </div>
                    </svelte:fragment>
                    <p class="u-color-text-offline u-small">
                        {restoreOption.description}
                    </p>
                </LabelCard>
            </div>
        {/each}
    </Layout.Stack>

    {#if selectedRestoreOption === 'new'}
        <Layout.Stack gap="s" alignItems="flex-start">
            <InputText
                id="name"
                label="Database name"
                placeholder="Enter database name"
                bind:value={newDatabaseInfo.name}
                autofocus
                required />
            {#if !showCustomId}
                <Tag
                    size="s"
                    on:click={() => {
                        showCustomId = true;
                    }}><Icon icon={IconPencil} /> Database ID</Tag>
            {:else}
                <RestoreModal
                    autofocus={false}
                    name="Database"
                    bind:show={showCustomId}
                    databaseId={$database.$id}
                    bind:id={newDatabaseInfo.id} />
            {/if}
        </Layout.Stack>
    {:else}
        <InputCheckbox
            required
            size="s"
            id="delete_policy"
            bind:checked={confirmSameDbRestore}
            label="Overwrite '{$database.name}' with the selected backup version">
        </InputCheckbox>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRestore = false)}>Cancel</Button>
        <Button submit disabled={disableButton}>Restore</Button>
    </svelte:fragment>
</Modal>
