<script lang="ts">
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { CardGrid, CopyInput, Copy, Code, Status } from '$lib/components';
    import { Button, InputSecret } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { capitalize } from '$lib/helpers/string';
    import { Status as DatabaseStatus, type Models } from '@appwrite.io/console';
    import {
        Badge,
        Layout,
        Typography,
        Alert,
        Icon,
        Input,
        Skeleton,
        Tabs,
        Divider
    } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconRefresh } from '@appwrite.io/pink-icons-svelte';
    import { getEngineDisplayName } from './dedicated';

    type ExtendedDedicatedDatabase = Models.DedicatedDatabase & {
        metricsSlowQueryLogThresholdMs?: number;
        metricsTraceSampleRate?: number;
        sqlApiEnabled?: boolean;
        sqlApiMaxBytes?: number;
        sqlApiMaxRows?: number;
        sqlApiTimeoutSeconds?: number;
        sqlApiAllowedStatements?: string[];
        maintenanceUpgradePolicy?: string;
        networkPublicTcp?: boolean;
        internalIP?: string;
    };

    const {
        database: raw
    }: {
        database: ExtendedDedicatedDatabase;
    } = $props();

    const defaults: Partial<ExtendedDedicatedDatabase> = {
        metricsSlowQueryLogThresholdMs: 0,
        metricsTraceSampleRate: 0,
        sqlApiEnabled: false,
        sqlApiMaxBytes: 0,
        sqlApiMaxRows: 0,
        sqlApiTimeoutSeconds: 0,
        sqlApiAllowedStatements: [],
        maintenanceUpgradePolicy: 'manual',
        networkPublicTcp: false,
        internalIP: '',
        pitrRetentionDays: 0,
        storageAutoscaling: false,
        storageAutoscalingThresholdPercent: 0,
        storageAutoscalingMaxGb: 0,
        lastMetricsPollAt: 0
    };

    const database: ExtendedDedicatedDatabase = $derived({ ...defaults, ...raw });

    let isRefreshing = $state(false);
    let isColdStarting = $state(false);
    let isPausing = $state(false);
    let isResuming = $state(false);
    let connectionTab = $state<'direct' | 'string'>('direct');

    const isDedicated = $derived(database.type === 'dedicateddb');
    const isActive = $derived(database.status === 'ready' || database.status === 'active');
    const isPaused = $derived(database.status === 'paused');

    // Map database status to Status component status
    const statusComponentStatus = $derived.by((): 'ready' | 'processing' | 'failed' | 'pending' => {
        switch (database.status) {
            case 'ready':
                return 'ready';
            case 'provisioning':
            case 'scaling':
            case 'restoring':
                return 'processing';
            case 'failed':
            case 'deleted':
                return 'failed';
            case 'inactive':
            case 'paused':
            default:
                return 'pending';
        }
    });

    // Map container status to Status component status
    const containerComponentStatus = $derived.by((): 'ready' | 'processing' | 'pending' => {
        switch (database.containerStatus) {
            case 'running':
            case 'active':
                return 'ready';
            case 'starting':
            case 'spinning_down':
            case 'freezing':
                return 'processing';
            case 'inactive':
            default:
                return 'pending';
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

    const tierConnectionLimits: Record<string, number> = {
        's-1vcpu-1gb': 100,
        's-2vcpu-2gb': 200,
        's-2vcpu-4gb': 500,
        's-4vcpu-8gb': 1000,
        's-4vcpu-16gb': 2000,
        's-4vcpu-32gb': 4000,
        's-8vcpu-32gb': 5000,
        's-8vcpu-64gb': 10000
    };

    const tierMaxConnections = $derived(tierConnectionLimits[database.tier] ?? null);

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
                .compute.updateDatabaseActivity({ databaseId: database.$id });

            addNotification({
                type: 'success',
                message: 'Database is starting up'
            });

            trackEvent(Click.DatabaseColdStart);

            await invalidate(Dependencies.DATABASE);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isColdStarting = false;
        }
    }

    async function pauseDatabase() {
        isPausing = true;
        try {
            await sdk.forProject(page.params.region, page.params.project).compute.updateDatabase({
                databaseId: database.$id,
                status: 'paused' as unknown as DatabaseStatus
            });

            addNotification({
                type: 'success',
                message: 'Database is pausing'
            });
            trackEvent(Click.DatabasePause);
            await invalidate(Dependencies.DATABASE);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isPausing = false;
        }
    }

    async function resumeDatabase() {
        isResuming = true;
        try {
            await sdk.forProject(page.params.region, page.params.project).compute.updateDatabase({
                databaseId: database.$id,
                status: DatabaseStatus.Active
            });

            addNotification({
                type: 'success',
                message: 'Database is resuming'
            });
            trackEvent(Click.DatabaseResume);
            await invalidate(Dependencies.DATABASE);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            isResuming = false;
        }
    }

    // Check if connection details are available
    const hasConnectionDetails = $derived(!!database.hostname || !!database.connectionString);

    const hasCredentials = $derived(!!database.connectionUser && !!database.connectionPassword);

    const defaultDatabaseName = $derived(database.engine === 'postgres' ? 'postgres' : '');

    const resolvedConnectionString = $derived.by(() => {
        if (database.connectionString) return database.connectionString;
        if (!database.hostname || !hasCredentials) return '';
        const user = encodeURIComponent(database.connectionUser);
        const password = encodeURIComponent(database.connectionPassword);
        const suffix = defaultDatabaseName ? `/${defaultDatabaseName}` : '';
        return `${database.engine}://${user}:${password}@${database.hostname}:${database.connectionPort}${suffix}`;
    });

    function escapeShellSingleQuote(value: string): string {
        return value.replace(/'/g, "'\\''");
    }

    function getConnectionCommand(): string {
        if (!resolvedConnectionString) return '';

        switch (database.engine) {
            case 'postgres':
                return `psql '${escapeShellSingleQuote(resolvedConnectionString)}'`;
            case 'mysql':
            case 'mariadb':
                return `mysql -h '${escapeShellSingleQuote(database.hostname)}' -P '${escapeShellSingleQuote(String(database.connectionPort))}' -u '${escapeShellSingleQuote(database.connectionUser)}' -p'${escapeShellSingleQuote(database.connectionPassword)}'`;
            default:
                return resolvedConnectionString;
        }
    }

    function formatMaintenanceDay(day: string): string {
        const days: Record<string, string> = {
            sun: 'Sunday',
            mon: 'Monday',
            tue: 'Tuesday',
            wed: 'Wednesday',
            thu: 'Thursday',
            fri: 'Friday',
            sat: 'Saturday'
        };
        return days[day] ?? day;
    }

    function formatHourUtc(hour: number): string {
        const h = hour % 24;
        const suffix = h >= 12 ? 'PM' : 'AM';
        const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${display}:00 ${suffix} UTC`;
    }

    function formatUpgradePolicy(policy: string): string {
        switch (policy) {
            case 'autoMinor':
                return 'Auto (minor versions)';
            case 'manual':
                return 'Manual';
            case 'scheduled':
                return 'Scheduled';
            default:
                return policy;
        }
    }

    function formatBytes(bytes: number): string {
        if (bytes >= 1_073_741_824) {
            return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
        }
        if (bytes >= 1_048_576) {
            return `${(bytes / 1_048_576).toFixed(1)} MB`;
        }
        if (bytes >= 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${bytes} B`;
    }

    function formatStorageClass(sc: string): string {
        switch (sc) {
            case 'ssd':
                return 'SSD';
            case 'nvme':
                return 'NVMe';
            case 'hdd':
                return 'HDD';
            default:
                return sc.toUpperCase();
        }
    }
</script>

<Container>
    <!-- Status Card -->
    <CardGrid>
        <svelte:fragment slot="title">Status</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="l">
                <Layout.Stack direction="row" gap="xl" alignItems="center" wrap="wrap">
                    <Status status={statusComponentStatus}>
                        {capitalize(database.status)}
                    </Status>

                    {#if database.containerStatus}
                        <Status status={containerComponentStatus}>
                            Container: {capitalize(database.containerStatus)}
                        </Status>
                    {/if}

                    <Typography.Text variant="m-500">
                        {database.region.toUpperCase()}
                    </Typography.Text>
                </Layout.Stack>

                {#if database.error}
                    <Alert.Inline status="error" title="Error">
                        {database.error}
                    </Alert.Inline>
                {/if}

                <Layout.Stack direction="row" gap="xl" wrap="wrap">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Created {toLocaleDateTime(database.$createdAt)}
                    </Typography.Caption>
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Updated {toLocaleDateTime(database.$updatedAt)}
                    </Typography.Caption>
                </Layout.Stack>
            </Layout.Stack>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            {#if database.containerStatus === 'inactive'}
                <Button secondary disabled={isColdStarting} on:click={triggerColdStart}>
                    {isColdStarting ? 'Starting...' : 'Start Database'}
                </Button>
            {/if}
            {#if isDedicated && isActive}
                <Button secondary disabled={isPausing} on:click={pauseDatabase}>
                    {isPausing ? 'Pausing...' : 'Pause'}
                </Button>
            {/if}
            {#if isPaused}
                <Button secondary disabled={isResuming} on:click={resumeDatabase}>
                    {isResuming ? 'Resuming...' : 'Resume'}
                </Button>
            {/if}
            <Button secondary disabled={isRefreshing} on:click={refreshStatus}>
                <Icon icon={IconRefresh} size="s" slot="start" />
                Refresh
            </Button>
        </svelte:fragment>
    </CardGrid>

    <!-- Connection Settings -->
    {#if isActive && hasConnectionDetails && hasCredentials}
        <CardGrid>
            <svelte:fragment slot="title">Connection</svelte:fragment>
            Use these credentials to connect to your database.
            <svelte:fragment slot="aside">
                <Layout.Stack gap="l">
                    <div>
                        <Tabs.Root variant="secondary" let:root>
                            <Tabs.Item.Button
                                {root}
                                on:click={() => (connectionTab = 'direct')}
                                active={connectionTab === 'direct'}>
                                Direct Connection
                            </Tabs.Item.Button>
                            <Tabs.Item.Button
                                {root}
                                on:click={() => (connectionTab = 'string')}
                                active={connectionTab === 'string'}>
                                Connection String
                            </Tabs.Item.Button>
                        </Tabs.Root>
                        <Divider />
                    </div>

                    {#if connectionTab === 'direct'}
                        <Layout.Grid columns={2} columnsS={1} gap="m">
                            <CopyInput label="Host" value={database.hostname} />
                            <CopyInput label="Port" value={String(database.connectionPort)} />
                            <CopyInput label="Username" value={database.connectionUser} />
                            <div class="password-field">
                                <InputSecret
                                    id="password"
                                    label="Password"
                                    value={database.connectionPassword} />
                                <div class="password-copy">
                                    <Copy value={database.connectionPassword}>
                                        <Input.Action icon={IconDuplicate} />
                                    </Copy>
                                </div>
                            </div>
                        </Layout.Grid>
                        {#if defaultDatabaseName}
                            <CopyInput label="Database" value={defaultDatabaseName} />
                        {/if}
                        {#if database.externalIP || database.internalIP}
                            <Layout.Grid columns={2} columnsS={1} gap="m">
                                {#if database.externalIP}
                                    <CopyInput label="External IP" value={database.externalIP} />
                                {/if}
                                {#if database.internalIP}
                                    <CopyInput label="Internal IP" value={database.internalIP} />
                                {/if}
                            </Layout.Grid>
                        {/if}
                    {:else}
                        <Layout.Stack gap="m">
                            <CopyInput label="Connection String" value={resolvedConnectionString} />
                            <Layout.Stack gap="xs">
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    Terminal Command
                                </Typography.Caption>
                                <Code language="sh" code={getConnectionCommand()} withCopy />
                            </Layout.Stack>
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    {:else if isActive && hasConnectionDetails && !hasCredentials}
        <CardGrid>
            <svelte:fragment slot="title">Connection</svelte:fragment>
            <svelte:fragment slot="aside">
                <Layout.Stack gap="l">
                    <Alert.Inline status="info" title="Credentials provisioning">
                        Your database is available but credentials are still being provisioned.
                        Connection credentials will appear here shortly.
                    </Alert.Inline>
                    <Layout.Grid columns={2} columnsS={1} gap="m">
                        <CopyInput label="Host" value={database.hostname} />
                        <CopyInput label="Port" value={String(database.connectionPort)} />
                    </Layout.Grid>
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    {:else if database.status === 'provisioning'}
        <CardGrid>
            <svelte:fragment slot="title">Connection</svelte:fragment>
            <svelte:fragment slot="aside">
                <Layout.Stack gap="l">
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

    <!-- Resources -->
    <CardGrid>
        <svelte:fragment slot="title">Resources</svelte:fragment>
        Your database configuration and allocated resources.
        <svelte:fragment slot="aside">
            <Layout.Grid columns={3} columnsL={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Engine
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {getEngineDisplayName(database.engine)}
                        {database.version}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Tier
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {capitalize(database.tier)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Backend
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {capitalize(database.backend)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        CPU
                    </Typography.Caption>
                    <Typography.Text variant="m-500">{cpuDisplay}</Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Memory
                    </Typography.Caption>
                    <Typography.Text variant="m-500">{memoryDisplay}</Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Storage
                    </Typography.Caption>
                    <Typography.Text variant="m-500">{storageDisplay}</Typography.Text>
                </Layout.Stack>
                {#if database.storageClass}
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Storage Class
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {formatStorageClass(database.storageClass)}
                        </Typography.Text>
                    </Layout.Stack>
                {/if}
            </Layout.Grid>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <svelte:fragment slot="title">High Availability</svelte:fragment>
        Configure replicas and failover settings for your database.
        <svelte:fragment slot="aside">
            <Layout.Grid columns={3} columnsL={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Status
                    </Typography.Caption>
                    <Badge
                        type={database.highAvailability ? 'success' : undefined}
                        variant="secondary"
                        size="s"
                        content={database.highAvailability ? 'Enabled' : 'Disabled'} />
                </Layout.Stack>
                {#if database.highAvailability}
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Replicas
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {database.haReplicaCount}
                        </Typography.Text>
                    </Layout.Stack>
                    {#if database.haSyncMode}
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Sync Mode
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {capitalize(database.haSyncMode)}
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}
                {/if}
            </Layout.Grid>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <svelte:fragment slot="title">Network</svelte:fragment>
        Connection limits and network configuration.
        <svelte:fragment slot="aside">
            <Layout.Stack gap="l">
                <Layout.Grid columns={3} columnsL={2} columnsS={1} gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Max Connections
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {database.networkMaxConnections}{#if tierMaxConnections}
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    / {tierMaxConnections.toLocaleString()} (tier limit)
                                </Typography.Caption>
                            {/if}
                        </Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Connection Timeout
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {database.networkIdleTimeoutSeconds}s
                        </Typography.Text>
                    </Layout.Stack>
                    {#if database.idleTimeoutMinutes}
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Scale-to-Zero After
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {database.idleTimeoutMinutes} min
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Grid>

                {#if database.networkIPAllowlist?.length > 0}
                    <Layout.Stack gap="xs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            IP Allowlist
                        </Typography.Caption>
                        <Layout.Stack direction="row" gap="xs" wrap="wrap">
                            {#each database.networkIPAllowlist as ip}
                                <Badge variant="secondary" size="s" content={ip} />
                            {/each}
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </svelte:fragment>
    </CardGrid>

    <!-- Backups -->
    <CardGrid>
        <svelte:fragment slot="title">Backups</svelte:fragment>
        Automatic backup and point-in-time recovery settings.
        <svelte:fragment slot="aside">
            <Layout.Grid columns={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Automatic Backups
                    </Typography.Caption>
                    <Badge
                        type={database.backupEnabled ? 'success' : undefined}
                        variant="secondary"
                        size="s"
                        content={database.backupEnabled ? 'Enabled' : 'Disabled'} />
                </Layout.Stack>
                {#if database.backupEnabled}
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Point-in-Time Recovery
                        </Typography.Caption>
                        <Layout.Stack direction="row" gap="xs" alignItems="center">
                            <Badge
                                type={database.backupPitr ? 'success' : undefined}
                                variant="secondary"
                                size="s"
                                content={database.backupPitr ? 'Enabled' : 'Disabled'} />
                            {#if database.backupPitr && database.pitrRetentionDays}
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    ({database.pitrRetentionDays} day window)
                                </Typography.Caption>
                            {/if}
                        </Layout.Stack>
                    </Layout.Stack>
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
                {/if}
            </Layout.Grid>
        </svelte:fragment>
    </CardGrid>

    <!-- Storage Autoscaling -->
    <CardGrid>
        <svelte:fragment slot="title">Storage Autoscaling</svelte:fragment>
        Automatically expand storage when usage reaches the configured threshold.
        <svelte:fragment slot="aside">
            <Layout.Grid columns={3} columnsL={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Status
                    </Typography.Caption>
                    <Badge
                        type={database.storageAutoscaling ? 'success' : undefined}
                        variant="secondary"
                        size="s"
                        content={database.storageAutoscaling ? 'Enabled' : 'Disabled'} />
                </Layout.Stack>
                {#if database.storageAutoscaling}
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Threshold
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {database.storageAutoscalingThresholdPercent}%
                        </Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Max Storage
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {formatStorage(database.storageAutoscalingMaxGb)}
                        </Typography.Text>
                    </Layout.Stack>
                {/if}
            </Layout.Grid>
        </svelte:fragment>
    </CardGrid>

    <!-- Maintenance Window -->
    <CardGrid>
        <svelte:fragment slot="title">Maintenance Window</svelte:fragment>
        Scheduled maintenance window and upgrade policy for your database.
        <svelte:fragment slot="aside">
            <Layout.Grid columns={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Day
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {formatMaintenanceDay(database.maintenanceWindowDay)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Time
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {formatHourUtc(database.maintenanceWindowHourUtc)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Duration
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {database.maintenanceWindowDurationMinutes} minutes
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Upgrade Policy
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {formatUpgradePolicy(database.maintenanceUpgradePolicy)}
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Grid>
        </svelte:fragment>
    </CardGrid>

    <!-- SQL API -->
    <CardGrid>
        <svelte:fragment slot="title">SQL API</svelte:fragment>
        Execute SQL statements directly through the Appwrite API.
        <svelte:fragment slot="aside">
            <Layout.Stack gap="l">
                <Layout.Grid columns={2} columnsS={1} gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Status
                        </Typography.Caption>
                        <Badge
                            type={database.sqlApiEnabled ? 'success' : undefined}
                            variant="secondary"
                            size="s"
                            content={database.sqlApiEnabled ? 'Enabled' : 'Disabled'} />
                    </Layout.Stack>
                    {#if database.sqlApiEnabled}
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Max Response Size
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {formatBytes(database.sqlApiMaxBytes)}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Max Rows
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {database.sqlApiMaxRows.toLocaleString()}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Timeout
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {database.sqlApiTimeoutSeconds}s
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Grid>

                {#if database.sqlApiEnabled && database.sqlApiAllowedStatements?.length > 0}
                    <Layout.Stack gap="xs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Allowed Statements
                        </Typography.Caption>
                        <Layout.Stack direction="row" gap="xs" wrap="wrap">
                            {#each database.sqlApiAllowedStatements as statement}
                                <Badge
                                    variant="secondary"
                                    size="s"
                                    content={statement.toUpperCase()} />
                            {/each}
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        </svelte:fragment>
    </CardGrid>

    <!-- Monitoring -->
    {#if database.metricsEnabled}
        <CardGrid>
            <svelte:fragment slot="title">Monitoring</svelte:fragment>
            Performance monitoring and slow query detection settings.
            <svelte:fragment slot="aside">
                <Layout.Grid columns={2} columnsS={1} gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Slow Query Threshold
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {database.metricsSlowQueryLogThresholdMs.toLocaleString()} ms
                        </Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                            Trace Sample Rate
                        </Typography.Caption>
                        <Typography.Text variant="m-500">
                            {(database.metricsTraceSampleRate * 100).toFixed(0)}%
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Grid>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

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
</style>
