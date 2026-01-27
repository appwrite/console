<script lang="ts">
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { CardGrid, CopyInput, Copy } from '$lib/components';
    import { Button, InputSecret } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import type {
        DedicatedDatabase,
        DedicatedDatabaseCredentials
    } from '$lib/sdk/dedicatedDatabases';
    import {
        Badge,
        Layout,
        Typography,
        Alert,
        Icon,
        Input,
        Skeleton
    } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconTerminal, IconRefresh } from '@appwrite.io/pink-icons-svelte';
    import ConnectModal from './connectModal.svelte';

    const {
        database,
        credentials
    }: {
        database: DedicatedDatabase;
        credentials: DedicatedDatabaseCredentials | null;
    } = $props();

    let showConnectModal = $state(false);
    let isRefreshing = $state(false);
    let isColdStarting = $state(false);

    // Status badge type mapping
    const statusBadgeType = $derived.by((): 'success' | 'warning' | 'error' | undefined => {
        switch (database.status) {
            case 'ready':
                return 'success';
            case 'provisioning':
            case 'deleting':
                return 'warning';
            case 'failed':
            case 'deleted':
                return 'error';
            default:
                return undefined;
        }
    });

    // Container status badge type
    const containerBadgeType = $derived.by((): 'success' | 'warning' | undefined => {
        switch (database.containerStatus) {
            case 'running':
                return 'success';
            case 'starting':
                return 'warning';
            case 'inactive':
            default:
                return undefined;
        }
    });

    // Format resource values
    const cpuDisplay = $derived(`${database.cpu} ${database.cpu === 1 ? 'Core' : 'Cores'}`);
    const memoryDisplay = $derived(formatMemory(database.memory));
    const storageDisplay = $derived(formatStorage(database.storage));

    function formatMemory(mb: number): string {
        if (mb >= 1024) {
            return `${(mb / 1024).toFixed(1)} GB`;
        }
        return `${mb} MB`;
    }

    function formatStorage(gb: number): string {
        if (gb >= 1000) {
            return `${(gb / 1000).toFixed(1)} TB`;
        }
        return `${gb} GB`;
    }

    function getEngineDisplayName(engine: string): string {
        switch (engine) {
            case 'postgres':
                return 'PostgreSQL';
            case 'mysql':
                return 'MySQL';
            case 'mariadb':
                return 'MariaDB';
            default:
                return engine;
        }
    }

    async function refreshStatus() {
        isRefreshing = true;
        try {
            await invalidate(Dependencies.DATABASE);
            addNotification({
                type: 'success',
                message: 'Status refreshed'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isRefreshing = false;
        }
    }

    async function triggerColdStart() {
        isColdStarting = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.coldStart(database.$id);

            addNotification({
                type: 'success',
                message: 'Database is starting up'
            });

            trackEvent('click_database_cold_start');

            // Refresh status after a short delay
            setTimeout(() => invalidate(Dependencies.DATABASE), 2000);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isColdStarting = false;
        }
    }

    // Generate connection command based on engine
    function getConnectionCommand(): string {
        if (!credentials) return '';

        switch (database.engine) {
            case 'postgres':
                return `psql "postgresql://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.database}"`;
            case 'mysql':
            case 'mariadb':
                return `mysql -h ${credentials.host} -P ${credentials.port} -u ${credentials.username} -p${credentials.password} ${credentials.database}`;
            default:
                return credentials.connectionString;
        }
    }
</script>

<Container databasesMainScreen>
    <!-- Status Section -->
    <CardGrid>
        <svelte:fragment slot="title">Status</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="l">
                <Layout.Stack direction="row" gap="l" alignItems="center">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Database Status</Typography.Text>
                        <Badge
                            type={statusBadgeType}
                            variant="secondary"
                            size="s"
                            content={database.status.charAt(0).toUpperCase() +
                                database.status.slice(1)} />
                    </Layout.Stack>

                    {#if database.containerStatus}
                        <Layout.Stack gap="xxs">
                            <Typography.Text variant="m-500">Container</Typography.Text>
                            <Badge
                                type={containerBadgeType}
                                variant="secondary"
                                size="s"
                                content={database.containerStatus.charAt(0).toUpperCase() +
                                    database.containerStatus.slice(1)} />
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>

                {#if database.error}
                    <Alert.Inline status="error" title="Error">
                        {database.error}
                    </Alert.Inline>
                {/if}

                <div class="grid-1-2-col-2">
                    <p>Created: {toLocaleDateTime(database.$createdAt)}</p>
                    <p>Last updated: {toLocaleDateTime(database.$updatedAt)}</p>
                </div>
            </Layout.Stack>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            {#if database.containerStatus === 'inactive'}
                <Button secondary disabled={isColdStarting} on:click={triggerColdStart}>
                    {isColdStarting ? 'Starting...' : 'Start Database'}
                </Button>
            {/if}
            <Button secondary disabled={isRefreshing} on:click={refreshStatus}>
                <Icon icon={IconRefresh} size="s" slot="start" />
                Refresh
            </Button>
        </svelte:fragment>
    </CardGrid>

    <!-- Connection Settings Section -->
    {#if database.status === 'ready' && credentials}
        <CardGrid>
            <svelte:fragment slot="title">Connection Settings</svelte:fragment>
            Use these credentials to connect to your database directly.
            <svelte:fragment slot="aside">
                <Layout.Stack gap="m">
                    <CopyInput label="Host" value={credentials.host} />
                    <CopyInput label="Port" value={String(credentials.port)} />
                    <CopyInput label="Database" value={credentials.database} />
                    <CopyInput label="Username" value={credentials.username} />

                    <!-- Password with show/hide toggle -->
                    <div class="password-field">
                        <InputSecret id="password" label="Password" value={credentials.password} />
                        <div class="password-copy">
                            <Copy value={credentials.password}>
                                <Input.Action icon={IconDuplicate} />
                            </Copy>
                        </div>
                    </div>

                    <CopyInput label="Connection String" value={credentials.connectionString} />
                </Layout.Stack>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showConnectModal = true)}>
                    <Icon icon={IconTerminal} size="s" slot="start" />
                    Connect
                </Button>
            </svelte:fragment>
        </CardGrid>
    {:else if database.status === 'provisioning'}
        <CardGrid>
            <svelte:fragment slot="title">Connection Settings</svelte:fragment>
            <svelte:fragment slot="aside">
                <Layout.Stack gap="m">
                    <Alert.Inline status="info" title="Provisioning in progress">
                        Your database is being set up. Connection details will be available once
                        provisioning is complete.
                    </Alert.Inline>
                    <Layout.Stack gap="s">
                        <Skeleton variant="line" width="100%" height={40} />
                        <Skeleton variant="line" width="100%" height={40} />
                        <Skeleton variant="line" width="100%" height={40} />
                    </Layout.Stack>
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    {/if}

    <!-- Resources Section -->
    <CardGrid>
        <svelte:fragment slot="title">Resources</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="m">
                <Layout.Grid columns={2} columnsXS={1} gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Engine</Typography.Text>
                        <Typography.Text
                            >{getEngineDisplayName(database.engine)}
                            {database.version}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Tier</Typography.Text>
                        <Typography.Text
                            >{database.tier.charAt(0).toUpperCase() +
                                database.tier.slice(1)}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">CPU</Typography.Text>
                        <Typography.Text>{cpuDisplay}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Memory</Typography.Text>
                        <Typography.Text>{memoryDisplay}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Storage</Typography.Text>
                        <Typography.Text>{storageDisplay}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Storage Class</Typography.Text>
                        <Typography.Text>{database.storageClass}</Typography.Text>
                    </Layout.Stack>
                </Layout.Grid>
            </Layout.Stack>
        </svelte:fragment>
    </CardGrid>

    <!-- High Availability Section -->
    <CardGrid>
        <svelte:fragment slot="title">High Availability</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="m">
                <Layout.Grid columns={2} columnsXS={1} gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Status</Typography.Text>
                        <Badge
                            type={database.highAvailability ? 'success' : undefined}
                            variant="secondary"
                            size="s"
                            content={database.highAvailability ? 'Enabled' : 'Disabled'} />
                    </Layout.Stack>
                    {#if database.highAvailability}
                        <Layout.Stack gap="xxs">
                            <Typography.Text variant="m-500">Replica Count</Typography.Text>
                            <Typography.Text>{database.haReplicaCount}</Typography.Text>
                        </Layout.Stack>
                        {#if database.haSyncMode}
                            <Layout.Stack gap="xxs">
                                <Typography.Text variant="m-500">Sync Mode</Typography.Text>
                                <Typography.Text>{database.haSyncMode}</Typography.Text>
                            </Layout.Stack>
                        {/if}
                    {/if}
                </Layout.Grid>
            </Layout.Stack>
        </svelte:fragment>
    </CardGrid>

    <!-- Network Settings Section -->
    <CardGrid>
        <svelte:fragment slot="title">Network</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="m">
                <Layout.Grid columns={2} columnsXS={1} gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Max Connections</Typography.Text>
                        <Typography.Text>{database.networkMaxConnections}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Idle Timeout</Typography.Text>
                        <Typography.Text>{database.networkIdleTimeoutSeconds}s</Typography.Text>
                    </Layout.Stack>
                    {#if database.idleTimeoutMinutes}
                        <Layout.Stack gap="xxs">
                            <Typography.Text variant="m-500">Sleep After Idle</Typography.Text>
                            <Typography.Text>{database.idleTimeoutMinutes} min</Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Grid>

                {#if database.networkIPAllowlist?.length > 0}
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">IP Allowlist</Typography.Text>
                        <Layout.Stack gap="xs">
                            {#each database.networkIPAllowlist as ip}
                                <Typography.Text variant="m-400">{ip}</Typography.Text>
                            {/each}
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </svelte:fragment>
    </CardGrid>

    <!-- Backup Settings Section -->
    <CardGrid>
        <svelte:fragment slot="title">Backups</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="m">
                <Layout.Grid columns={2} columnsXS={1} gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-500">Status</Typography.Text>
                        <Badge
                            type={database.backupEnabled ? 'success' : undefined}
                            variant="secondary"
                            size="s"
                            content={database.backupEnabled ? 'Enabled' : 'Disabled'} />
                    </Layout.Stack>
                    {#if database.backupEnabled}
                        <Layout.Stack gap="xxs">
                            <Typography.Text variant="m-500"
                                >Point-in-Time Recovery</Typography.Text>
                            <Badge
                                type={database.backupPitr ? 'success' : undefined}
                                variant="secondary"
                                size="s"
                                content={database.backupPitr ? 'Enabled' : 'Disabled'} />
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Text variant="m-500">Schedule</Typography.Text>
                            <Typography.Text>{database.backupCron}</Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Text variant="m-500">Retention</Typography.Text>
                            <Typography.Text>{database.backupRetentionDays} days</Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Grid>
            </Layout.Stack>
        </svelte:fragment>
    </CardGrid>
</Container>

<ConnectModal
    bind:show={showConnectModal}
    {database}
    {credentials}
    connectionCommand={getConnectionCommand()} />

<style lang="scss">
    .password-field {
        position: relative;

        .password-copy {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
        }
    }

    .grid-1-2-col-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        color: var(--fgcolor-neutral-secondary);

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }
</style>
