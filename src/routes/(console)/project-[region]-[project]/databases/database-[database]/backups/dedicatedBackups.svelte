<script lang="ts">
    import { page } from '$app/state';
    import { Confirm, Modal } from '$lib/components';
    import { Button, InputRadio } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { CardGrid } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Type, type Models } from '@appwrite.io/console';
    import {
        ActionMenu,
        Alert,
        Icon,
        Layout,
        Popover,
        Status,
        Table,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconRefresh,
        IconShieldCheck,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';

    const {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    let backups = $state<Models.DedicatedDatabaseBackupList>({ total: 0, backups: [] });
    let restorations = $state<Models.DedicatedDatabaseRestorationList>({
        total: 0,
        restorations: []
    });
    let pitrWindows = $state<Models.DedicatedDatabasePITRWindows | null>(null);

    let isLoadingBackups = $state(true);
    let isLoadingRestorations = $state(true);
    let isLoadingPitr = $state(true);
    let isCreatingBackup = $state(false);

    let showDeleteConfirm = $state(false);
    let selectedBackup = $state<Models.DedicatedDatabaseBackup | null>(null);

    let showRestoreConfirm = $state(false);
    let restoreBackup = $state<Models.DedicatedDatabaseBackup | null>(null);

    let showPitrRestore = $state(false);
    let pitrTargetDateTime = $state('');

    let showCreateBackupModal = $state(false);
    let backupType = $state<'full' | 'incremental'>('full');

    let verifyingBackupId = $state<string | null>(null);
    let showVerifyConfirm = $state(false);
    let verifyBackup = $state<Models.DedicatedDatabaseBackup | null>(null);

    let activeTab = $state<'backups' | 'restorations'>('backups');

    const computeSdk = $derived(sdk.forProject(page.params.region, page.params.project).compute);

    function mapBackupStatus(
        status: string
    ): 'ready' | 'processing' | 'failed' | 'pending' | 'complete' {
        switch (status) {
            case 'completed':
            case 'verified':
                return 'complete';
            case 'running':
                return 'processing';
            case 'failed':
                return 'failed';
            case 'pending':
            default:
                return 'pending';
        }
    }

    function mapRestorationStatus(
        status: string
    ): 'ready' | 'processing' | 'failed' | 'pending' | 'complete' {
        switch (status) {
            case 'completed':
                return 'complete';
            case 'running':
                return 'processing';
            case 'failed':
                return 'failed';
            case 'pending':
            default:
                return 'pending';
        }
    }

    function formatBackupType(type: string): string {
        switch (type) {
            case 'full':
                return 'Full';
            case 'incremental':
                return 'Incremental';
            case 'wal':
                return 'WAL';
            default:
                return type;
        }
    }

    function formatTimestamp(ts: number): string {
        if (!ts) return '-';
        return toLocaleDateTime(new Date(ts * 1000).toISOString());
    }

    async function loadBackups() {
        isLoadingBackups = true;
        try {
            backups = await computeSdk.listDatabaseBackups({ databaseId: database.$id });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isLoadingBackups = false;
        }
    }

    async function loadRestorations() {
        isLoadingRestorations = true;
        try {
            restorations = await computeSdk.listDatabaseRestorations({ databaseId: database.$id });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isLoadingRestorations = false;
        }
    }

    async function loadPitrWindows() {
        if (!database.backupPitr) {
            isLoadingPitr = false;
            return;
        }
        isLoadingPitr = true;
        try {
            pitrWindows = await computeSdk.getDatabasePITRWindows({ databaseId: database.$id });
        } catch (error) {
            // PITR may not be available yet
            pitrWindows = null;
        } finally {
            isLoadingPitr = false;
        }
    }

    async function handleCreateBackup() {
        isCreatingBackup = true;
        try {
            await computeSdk.createDatabaseBackup({
                databaseId: database.$id,
                type: backupType as unknown as Type
            });
            addNotification({
                type: 'success',
                message: 'Backup creation started'
            });
            trackEvent(Submit.DedicatedBackupCreate);
            showCreateBackupModal = false;
            backupType = 'full';
            await loadBackups();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DedicatedBackupCreate);
        } finally {
            isCreatingBackup = false;
        }
    }

    async function handleDeleteBackup() {
        if (!selectedBackup) return;
        try {
            await computeSdk.deleteDatabaseBackup({
                databaseId: database.$id,
                backupId: selectedBackup.$id
            });
            addNotification({
                type: 'success',
                message: 'Backup deleted'
            });
            trackEvent(Submit.DedicatedBackupDelete);
            showDeleteConfirm = false;
            selectedBackup = null;
            await loadBackups();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DedicatedBackupDelete);
        }
    }

    async function handleRestoreBackup() {
        if (!restoreBackup) return;
        try {
            await computeSdk.createDatabaseRestoration({
                databaseId: database.$id,
                type: Type.Backup,
                backupId: restoreBackup.$id
            });
            addNotification({
                type: 'success',
                message: 'Restoration started from backup'
            });
            trackEvent(Submit.DedicatedBackupRestore);
            showRestoreConfirm = false;
            restoreBackup = null;
            await loadRestorations();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DedicatedBackupRestore);
        }
    }

    async function handlePitrRestore() {
        if (!pitrTargetDateTime) return;
        try {
            const targetTime = Math.floor(new Date(pitrTargetDateTime).getTime() / 1000);
            await computeSdk.createDatabaseRestoration({
                databaseId: database.$id,
                type: Type.Pitr,
                targetTime
            });
            addNotification({
                type: 'success',
                message: 'Point-in-time restoration started'
            });
            trackEvent(Submit.DedicatedPitrRestore);
            showPitrRestore = false;
            pitrTargetDateTime = '';
            await loadRestorations();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DedicatedPitrRestore);
        }
    }

    async function handleVerifyBackup() {
        if (!verifyBackup) return;
        verifyingBackupId = verifyBackup.$id;
        try {
            // @todo Replace with computeSdk.verifyDatabaseBackup() when SDK is updated
            await (computeSdk as unknown as Record<string, Function>).verifyDatabaseBackup({
                databaseId: database.$id,
                backupId: verifyBackup.$id
            });
            addNotification({
                type: 'success',
                message: 'Backup verification started'
            });
            trackEvent('submit_dedicated_backup_verify');
            showVerifyConfirm = false;
            verifyBackup = null;
            await loadBackups();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackEvent('submit_dedicated_backup_verify_error');
        } finally {
            verifyingBackupId = null;
        }
    }

    function formatPitrTime(isoString: string): string {
        if (!isoString) return '-';
        return toLocaleDateTime(isoString);
    }

    function toDateTimeLocalValue(isoString: string): string {
        if (!isoString) return '';
        const date = new Date(isoString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    // Load data on mount
    $effect(() => {
        loadBackups();
        loadRestorations();
        loadPitrWindows();
    });
</script>

<Container>
    <!-- Backup Configuration Summary -->
    <CardGrid>
        <svelte:fragment slot="title">Backup Configuration</svelte:fragment>
        Current backup settings for this database.
        <svelte:fragment slot="aside">
            <Layout.Grid columns={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Automatic Backups
                    </Typography.Caption>
                    <Status
                        status={database.backupEnabled ? 'complete' : 'pending'}
                        label={database.backupEnabled ? 'Enabled' : 'Disabled'} />
                </Layout.Stack>
                {#if database.backupEnabled}
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Schedule
                        </Typography.Caption>
                        <Typography.Text variant="m-500">{database.backupCron}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Retention
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {database.backupRetentionDays} days
                        </Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Point-in-Time Recovery
                        </Typography.Caption>
                        <Status
                            status={database.backupPitr ? 'complete' : 'pending'}
                            label={database.backupPitr ? 'Enabled' : 'Disabled'} />
                    </Layout.Stack>
                {/if}
            </Layout.Grid>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showCreateBackupModal = true)}>Create Backup</Button>
        </svelte:fragment>
    </CardGrid>

    <!-- PITR Section -->
    {#if database.backupPitr}
        <CardGrid>
            <svelte:fragment slot="title">Point-in-Time Recovery</svelte:fragment>
            Restore your database to any point within the recovery window.
            <svelte:fragment slot="aside">
                {#if isLoadingPitr}
                    <Typography.Text variant="m-400">Loading recovery window...</Typography.Text>
                {:else if pitrWindows}
                    <Layout.Stack gap="l">
                        <Layout.Grid columns={2} columnsS={1} gap="l">
                            <Layout.Stack gap="xxs">
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    Earliest Recovery Point
                                </Typography.Caption>
                                <Typography.Text variant="m-500">
                                    {formatPitrTime(pitrWindows.earliest)}
                                </Typography.Text>
                            </Layout.Stack>
                            <Layout.Stack gap="xxs">
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    Latest Recovery Point
                                </Typography.Caption>
                                <Typography.Text variant="m-500">
                                    {formatPitrTime(pitrWindows.latest)}
                                </Typography.Text>
                            </Layout.Stack>
                        </Layout.Grid>
                        {#if database.pitrRetentionDays}
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Retention window: {database.pitrRetentionDays} days
                            </Typography.Caption>
                        {/if}
                    </Layout.Stack>
                {:else}
                    <Alert.Inline status="info" title="No recovery window available">
                        PITR is enabled but no recovery points are available yet. Recovery points
                        will appear after the first WAL archive is created.
                    </Alert.Inline>
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
                {#if pitrWindows}
                    <Button secondary on:click={() => (showPitrRestore = true)}>
                        Restore to Point in Time
                    </Button>
                {/if}
            </svelte:fragment>
        </CardGrid>
    {/if}

    <!-- Backups / Restorations Tabs -->
    <Layout.Stack gap="l">
        <Tabs.Root variant="secondary" let:root>
            <Tabs.Item.Button
                {root}
                on:click={() => (activeTab = 'backups')}
                active={activeTab === 'backups'}>
                Backups ({backups.total})
            </Tabs.Item.Button>
            <Tabs.Item.Button
                {root}
                on:click={() => (activeTab = 'restorations')}
                active={activeTab === 'restorations'}>
                Restorations ({restorations.total})
            </Tabs.Item.Button>
        </Tabs.Root>

        {#if activeTab === 'backups'}
            {#if isLoadingBackups}
                <article class="empty card u-width-full-line common-section">
                    Loading backups...
                </article>
            {:else if backups.total === 0}
                <article class="empty card u-width-full-line common-section">
                    No backups yet. Create a manual backup or wait for the scheduled backup.
                </article>
            {:else}
                <Table.Root
                    columns={[
                        { id: 'id', width: { min: 120 } },
                        { id: 'type', width: { min: 100 } },
                        { id: 'status', width: { min: 120 } },
                        { id: 'size', width: { min: 100 } },
                        { id: 'started', width: { min: 140 } },
                        { id: 'completed', width: { min: 140 } },
                        { id: 'expires', width: { min: 140 } },
                        { id: 'actions', width: 64 }
                    ]}
                    let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="id" {root}>ID</Table.Header.Cell>
                        <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
                        <Table.Header.Cell column="status" {root}>Status</Table.Header.Cell>
                        <Table.Header.Cell column="size" {root}>Size</Table.Header.Cell>
                        <Table.Header.Cell column="started" {root}>Started</Table.Header.Cell>
                        <Table.Header.Cell column="completed" {root}>Completed</Table.Header.Cell>
                        <Table.Header.Cell column="expires" {root}>Expires</Table.Header.Cell>
                        <Table.Header.Cell column="actions" {root}></Table.Header.Cell>
                    </svelte:fragment>
                    {#each backups.backups as backup}
                        <Table.Row.Base id={backup.$id} {root}>
                            <Table.Cell column="id" {root}>
                                <Typography.Text variant="m-400">
                                    {backup.$id.substring(0, 8)}...
                                </Typography.Text>
                            </Table.Cell>
                            <Table.Cell column="type" {root}>
                                {formatBackupType(backup.type)}
                            </Table.Cell>
                            <Table.Cell column="status" {root}>
                                <Status
                                    status={mapBackupStatus(backup.status)}
                                    label={backup.status} />
                            </Table.Cell>
                            <Table.Cell column="size" {root}>
                                {backup.sizeBytes ? calculateSize(backup.sizeBytes) : '-'}
                            </Table.Cell>
                            <Table.Cell column="started" {root}>
                                {formatTimestamp(backup.startedAt)}
                            </Table.Cell>
                            <Table.Cell column="completed" {root}>
                                {formatTimestamp(backup.completedAt)}
                            </Table.Cell>
                            <Table.Cell column="expires" {root}>
                                {formatTimestamp(backup.expiresAt)}
                            </Table.Cell>
                            <Table.Cell column="actions" {root}>
                                <Popover let:toggle padding="m" placement="bottom-end">
                                    <Button extraCompact on:click={toggle}>
                                        <Icon icon={IconDotsHorizontal} />
                                    </Button>
                                    <svelte:fragment slot="tooltip" let:toggle>
                                        <ActionMenu.Root width="180px" noPadding>
                                            {#if backup.status === 'completed' || backup.status === 'verified'}
                                                <ActionMenu.Item.Button
                                                    trailingIcon={IconRefresh}
                                                    on:click={(e) => {
                                                        toggle(e);
                                                        restoreBackup = backup;
                                                        showRestoreConfirm = true;
                                                    }}>
                                                    Restore
                                                </ActionMenu.Item.Button>
                                            {/if}
                                            {#if backup.status === 'completed'}
                                                <ActionMenu.Item.Button
                                                    trailingIcon={IconShieldCheck}
                                                    on:click={(e) => {
                                                        toggle(e);
                                                        verifyBackup = backup;
                                                        showVerifyConfirm = true;
                                                    }}>
                                                    {verifyingBackupId === backup.$id
                                                        ? 'Verifying...'
                                                        : 'Verify'}
                                                </ActionMenu.Item.Button>
                                            {/if}
                                            <ActionMenu.Item.Button
                                                status="danger"
                                                trailingIcon={IconTrash}
                                                on:click={(e) => {
                                                    toggle(e);
                                                    selectedBackup = backup;
                                                    showDeleteConfirm = true;
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
            {/if}
        {:else if isLoadingRestorations}
            <article class="empty card u-width-full-line common-section">
                Loading restorations...
            </article>
        {:else if restorations.total === 0}
            <article class="empty card u-width-full-line common-section">
                No restorations yet.
            </article>
        {:else}
            <Table.Root
                columns={[
                    { id: 'id', width: { min: 120 } },
                    { id: 'type', width: { min: 120 } },
                    { id: 'status', width: { min: 120 } },
                    { id: 'backupId', width: { min: 120 } },
                    { id: 'targetTime', width: { min: 140 } },
                    { id: 'started', width: { min: 140 } },
                    { id: 'completed', width: { min: 140 } }
                ]}
                let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="id" {root}>ID</Table.Header.Cell>
                    <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
                    <Table.Header.Cell column="status" {root}>Status</Table.Header.Cell>
                    <Table.Header.Cell column="backupId" {root}>Backup ID</Table.Header.Cell>
                    <Table.Header.Cell column="targetTime" {root}>Target Time</Table.Header.Cell>
                    <Table.Header.Cell column="started" {root}>Started</Table.Header.Cell>
                    <Table.Header.Cell column="completed" {root}>Completed</Table.Header.Cell>
                </svelte:fragment>
                {#each restorations.restorations as restoration}
                    <Table.Row.Base id={restoration.$id} {root}>
                        <Table.Cell column="id" {root}>
                            <Typography.Text variant="m-400">
                                {restoration.$id.substring(0, 8)}...
                            </Typography.Text>
                        </Table.Cell>
                        <Table.Cell column="type" {root}>
                            {restoration.type === 'pitr' ? 'Point-in-Time' : 'Backup'}
                        </Table.Cell>
                        <Table.Cell column="status" {root}>
                            <Status
                                status={mapRestorationStatus(restoration.status)}
                                label={restoration.status} />
                        </Table.Cell>
                        <Table.Cell column="backupId" {root}>
                            {restoration.backupId
                                ? restoration.backupId.substring(0, 8) + '...'
                                : '-'}
                        </Table.Cell>
                        <Table.Cell column="targetTime" {root}>
                            {restoration.targetTime ? formatTimestamp(restoration.targetTime) : '-'}
                        </Table.Cell>
                        <Table.Cell column="started" {root}>
                            {formatTimestamp(restoration.startedAt)}
                        </Table.Cell>
                        <Table.Cell column="completed" {root}>
                            {formatTimestamp(restoration.completedAt)}
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
        {/if}
    </Layout.Stack>
</Container>

<!-- Verify Backup Confirmation -->
<Modal title="Verify backup" bind:show={showVerifyConfirm} onSubmit={handleVerifyBackup}>
    <Layout.Stack gap="l">
        <Typography.Text>
            Verify the integrity of this backup by restoring it to a temporary environment and
            running health checks.
        </Typography.Text>
        {#if verifyBackup}
            <Layout.Grid columns={2} columnsS={1} gap="m">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Backup ID
                    </Typography.Caption>
                    <Typography.Text variant="m-500">{verifyBackup.$id}</Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Type
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {formatBackupType(verifyBackup.type)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Size
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {verifyBackup.sizeBytes ? calculateSize(verifyBackup.sizeBytes) : '-'}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Created
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {toLocaleDateTime(verifyBackup.$createdAt)}
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Grid>
        {/if}
        <Alert.Inline status="info" title="Verification process">
            A temporary database will be created to restore and validate this backup. This does not
            affect your production database. The backup status will change to "verified" on success.
        </Alert.Inline>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showVerifyConfirm = false)}>Cancel</Button>
        <Button submit disabled={verifyingBackupId !== null}>
            {verifyingBackupId ? 'Verifying...' : 'Verify'}
        </Button>
    </svelte:fragment>
</Modal>

<!-- Delete Backup Confirmation -->
<Confirm title="Delete backup" bind:open={showDeleteConfirm} onSubmit={handleDeleteBackup}>
    <Typography.Text>
        Are you sure you want to delete this backup? This action is irreversible.
    </Typography.Text>
    {#if selectedBackup?.error}
        <Alert.Inline status="warning" title="Backup error">
            {selectedBackup.error}
        </Alert.Inline>
    {/if}
</Confirm>

<!-- Restore from Backup Confirmation -->
<Modal title="Restore from backup" bind:show={showRestoreConfirm} onSubmit={handleRestoreBackup}>
    <Layout.Stack gap="l">
        <Typography.Text>
            This will restore your database from the selected backup. Your database will be
            unavailable during the restoration process.
        </Typography.Text>
        {#if restoreBackup}
            <Layout.Grid columns={2} columnsS={1} gap="m">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Backup ID
                    </Typography.Caption>
                    <Typography.Text variant="m-500">{restoreBackup.$id}</Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Type
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {formatBackupType(restoreBackup.type)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Size
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {restoreBackup.sizeBytes ? calculateSize(restoreBackup.sizeBytes) : '-'}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Created
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {toLocaleDateTime(restoreBackup.$createdAt)}
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Grid>
        {/if}
        <Alert.Inline status="warning" title="Warning">
            The database will enter a restoring state and will be unavailable until the restoration
            completes.
        </Alert.Inline>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showRestoreConfirm = false)}>Cancel</Button>
        <Button submit>Restore</Button>
    </svelte:fragment>
</Modal>

<!-- Create Backup Modal -->
<Modal title="Create backup" bind:show={showCreateBackupModal} onSubmit={handleCreateBackup}>
    <Layout.Stack gap="l">
        <Typography.Text>Select the backup type to create.</Typography.Text>
        <Layout.Stack gap="s">
            <InputRadio
                id="backup-full"
                name="backupType"
                label="Full backup"
                value="full"
                bind:group={backupType} />
            <InputRadio
                id="backup-incremental"
                name="backupType"
                label="Incremental backup (only changes since last full backup)"
                value="incremental"
                bind:group={backupType} />
        </Layout.Stack>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCreateBackupModal = false)}>Cancel</Button>
        <Button submit disabled={isCreatingBackup}>
            {isCreatingBackup ? 'Creating...' : 'Create'}
        </Button>
    </svelte:fragment>
</Modal>

<!-- PITR Restore Modal -->
<Modal title="Point-in-Time Recovery" bind:show={showPitrRestore} onSubmit={handlePitrRestore}>
    <Layout.Stack gap="l">
        <Typography.Text>
            Select a target date and time to restore your database to. The target must be within the
            available recovery window.
        </Typography.Text>
        {#if pitrWindows}
            <Layout.Grid columns={2} columnsS={1} gap="m">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Earliest
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {formatPitrTime(pitrWindows.earliest)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Latest
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {formatPitrTime(pitrWindows.latest)}
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Grid>
        {/if}
        <Layout.Stack gap="xs">
            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                Target Date and Time
            </Typography.Caption>
            <input
                type="datetime-local"
                class="input-text"
                bind:value={pitrTargetDateTime}
                min={pitrWindows ? toDateTimeLocalValue(pitrWindows.earliest) : undefined}
                max={pitrWindows ? toDateTimeLocalValue(pitrWindows.latest) : undefined}
                required />
        </Layout.Stack>
        <Alert.Inline status="warning" title="Warning">
            The database will enter a restoring state and will be unavailable until the restoration
            completes. All data after the selected point in time will be lost.
        </Alert.Inline>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showPitrRestore = false)}>Cancel</Button>
        <Button submit disabled={!pitrTargetDateTime}>Restore</Button>
    </svelte:fragment>
</Modal>

<style>
    .empty {
        block-size: 200px;
        text-align: center;
        align-content: center;
    }

    :global(.common-section) {
        margin-block-start: 0 !important;
    }
</style>
