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
    import { trackEvent } from '$lib/actions/analytics';
    import type { DedicatedDatabase } from '$lib/sdk/dedicatedDatabases';
    import {
        Badge,
        Layout,
        Typography,
        Alert,
        Icon,
        Input,
        Skeleton,
        Tabs,
        Divider,
        Card
    } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconRefresh } from '@appwrite.io/pink-icons-svelte';

    const {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    let isRefreshing = $state(false);
    let isColdStarting = $state(false);
    let connectionTab = $state<'direct' | 'string'>('direct');

    // Check if this is a Prisma database
    const isPrisma = $derived(database.backend === 'prisma');

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

    function capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
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

    // Check if connection details are available
    const hasConnectionDetails = $derived(
        database.hostname && database.connectionUser && database.connectionPassword
    );

    // Generate connection command based on engine
    function getConnectionCommand(): string {
        if (!hasConnectionDetails) return '';

        switch (database.engine) {
            case 'postgres':
                return `psql "${database.connectionString}"`;
            case 'mysql':
            case 'mariadb':
                return `mysql -h ${database.hostname} -P ${database.connectionPort} -u ${database.connectionUser} -p${database.connectionPassword} postgres`;
            default:
                return database.connectionString;
        }
    }
</script>

<Container>
    <!-- Status Card -->
    <CardGrid>
        <svelte:fragment slot="title">Status</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="l">
                <Layout.Stack direction="row" gap="xl" alignItems="center" wrap>
                    <Status status={statusComponentStatus}>
                        {capitalizeFirst(database.status)}
                    </Status>

                    {#if database.containerStatus && !isPrisma}
                        <Status status={containerComponentStatus}>
                            Container: {capitalizeFirst(database.containerStatus)}
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

                <Layout.Stack direction="row" gap="xl" wrap>
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
            {#if database.containerStatus === 'inactive' && !isPrisma}
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

    <!-- Connection Settings -->
    {#if database.status === 'ready' && hasConnectionDetails}
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
                        <CopyInput label="Database" value="postgres" />
                    {:else}
                        <Layout.Stack gap="m">
                            <CopyInput
                                label="Connection String"
                                value={database.connectionString} />
                            <Layout.Stack gap="xs">
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    Terminal Command
                                </Typography.Caption>
                                <Code language="bash" code={getConnectionCommand()} withCopy />
                            </Layout.Stack>
                        </Layout.Stack>
                    {/if}
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
            <Layout.Grid columns={3} columnsM={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Engine
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {getEngineDisplayName(database.engine)} {database.version}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Tier
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {capitalizeFirst(database.tier)}
                    </Typography.Text>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Backend
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {capitalizeFirst(database.backend)}
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
            </Layout.Grid>
        </svelte:fragment>
    </CardGrid>

    <!-- High Availability - Only show for non-Prisma databases -->
    {#if !isPrisma}
        <CardGrid>
            <svelte:fragment slot="title">High Availability</svelte:fragment>
            Configure replicas and failover settings for your database.
            <svelte:fragment slot="aside">
                <Layout.Grid columns={3} columnsM={2} columnsS={1} gap="l">
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
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    Sync Mode
                                </Typography.Caption>
                                <Typography.Text variant="m-500">
                                    {capitalizeFirst(database.haSyncMode)}
                                </Typography.Text>
                            </Layout.Stack>
                        {/if}
                    {/if}
                </Layout.Grid>
            </svelte:fragment>
        </CardGrid>
    {/if}

    <!-- Network - Only show for non-Prisma databases -->
    {#if !isPrisma}
        <CardGrid>
            <svelte:fragment slot="title">Network</svelte:fragment>
            Connection limits and network configuration.
            <svelte:fragment slot="aside">
                <Layout.Stack gap="l">
                    <Layout.Grid columns={3} columnsM={2} columnsS={1} gap="l">
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Max Connections
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {database.networkMaxConnections}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Idle Timeout
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {database.networkIdleTimeoutSeconds}s
                            </Typography.Text>
                        </Layout.Stack>
                        {#if database.idleTimeoutMinutes}
                            <Layout.Stack gap="xxs">
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    Sleep After Idle
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
                            <Layout.Stack direction="row" gap="xs" wrap>
                                {#each database.networkIPAllowlist as ip}
                                    <Badge variant="secondary" size="s" content={ip} />
                                {/each}
                            </Layout.Stack>
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    {/if}

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
                        <Badge
                            type={database.backupPitr ? 'success' : undefined}
                            variant="secondary"
                            size="s"
                            content={database.backupPitr ? 'Enabled' : 'Disabled'} />
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
