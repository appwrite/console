<script lang="ts">
    import { page } from '$app/state';
    import { CardGrid, Code } from '$lib/components';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { trackEvent } from '$lib/actions/analytics';
    import { Period, type Models } from '@appwrite.io/console';
    import {
        Alert,
        Badge,
        Icon,
        Layout,
        Skeleton,
        Table,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconRefresh } from '@appwrite.io/pink-icons-svelte';
    import { Button, InputChoice, InputTextarea } from '$lib/elements/forms';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    type ExtendedDedicatedDatabase = Models.DedicatedDatabase & {
        metricsSlowQueryLogThresholdMs?: number;
    };

    const database = $derived(data.dedicatedDatabase as ExtendedDedicatedDatabase);

    const computeSdk = $derived(sdk.forProject(page.params.region, page.params.project).compute);

    let metricsPeriod = $state<'1h' | '24h' | '7d' | '30d'>('24h');
    let metrics = $state<Models.DedicatedDatabaseMetrics | null>(null);
    let slowQueries = $state<Models.DedicatedDatabaseSlowQueryList>({ total: 0, slowQueries: [] });
    let performanceInsights = $state<Models.DedicatedDatabasePerformanceInsights | null>(null);
    let auditLogs = $state<Models.DedicatedDatabaseAuditLogList>({ total: 0, auditLogs: [] });

    let isLoadingMetrics = $state(true);
    let isLoadingSlowQueries = $state(true);
    let isLoadingInsights = $state(true);
    let isLoadingAuditLogs = $state(true);

    // Schema state
    let schema = $state<Record<string, unknown> | null>(null);
    let isLoadingSchema = $state(false);
    let schemaLoaded = $state(false);

    // Schema Preview state
    let previewSql = $state('');
    let previewResult = $state<Record<string, unknown> | null>(null);
    let isLoadingPreview = $state(false);

    // Explain Query state
    let explainQuery = $state('');
    let explainAnalyze = $state(false);
    let explainResult = $state<Record<string, unknown> | null>(null);
    let isLoadingExplain = $state(false);

    // Tuning state
    let tuningResult = $state<Record<string, unknown> | null>(null);
    let isLoadingTuning = $state(false);
    let tuningLoaded = $state(false);

    // Index Suggestions state
    let indexSuggestions = $state<Record<string, unknown> | null>(null);
    let isLoadingIndexSuggestions = $state(false);
    let indexSuggestionsLoaded = $state(false);

    type ActiveSection =
        | 'metrics'
        | 'slowQueries'
        | 'insights'
        | 'auditLogs'
        | 'schema'
        | 'schemaPreview'
        | 'explain'
        | 'tuning'
        | 'indexes';

    let activeSection = $state<ActiveSection>('metrics');

    const slowQueryColumns = [
        { id: 'query', width: { min: 200 } },
        { id: 'duration', width: { min: 100 } },
        { id: 'calls', width: { min: 80 } },
        { id: 'user', width: { min: 100 } },
        { id: 'database', width: { min: 100 } }
    ];

    const topQueryColumns = [
        { id: 'query', width: { min: 200 } },
        { id: 'calls', width: { min: 80 } },
        { id: 'totalTime', width: { min: 100 } },
        { id: 'meanTime', width: { min: 100 } },
        { id: 'rows', width: { min: 80 } }
    ];

    const waitEventColumns = [
        { id: 'event', width: { min: 140 } },
        { id: 'type', width: { min: 100 } },
        { id: 'count', width: { min: 80 } },
        { id: 'totalWait', width: { min: 100 } }
    ];

    const auditLogColumns = [
        { id: 'timestamp', width: { min: 140 } },
        { id: 'user', width: { min: 100 } },
        { id: 'action', width: { min: 100 } },
        { id: 'object', width: { min: 120 } },
        { id: 'statement', width: { min: 200 } },
        { id: 'client', width: { min: 120 } }
    ];

    async function loadMetrics() {
        if (!database) return;
        isLoadingMetrics = true;
        try {
            metrics = await computeSdk.getDatabaseMetrics({
                databaseId: database.$id,
                period: metricsPeriod as Period
            });
        } catch (error) {
            metrics = null;
            addNotification({
                type: 'error',
                message: `Failed to load metrics: ${error.message}`
            });
        } finally {
            isLoadingMetrics = false;
        }
    }

    async function loadSlowQueries() {
        if (!database) return;
        isLoadingSlowQueries = true;
        try {
            slowQueries = await computeSdk.listDatabaseQueries({ databaseId: database.$id });
        } catch (error) {
            slowQueries = { total: 0, slowQueries: [] };
        } finally {
            isLoadingSlowQueries = false;
        }
    }

    async function loadPerformanceInsights() {
        if (!database) return;
        isLoadingInsights = true;
        try {
            performanceInsights = await computeSdk.getDatabaseInsights({
                databaseId: database.$id
            });
        } catch (error) {
            performanceInsights = null;
        } finally {
            isLoadingInsights = false;
        }
    }

    async function loadAuditLogs() {
        if (!database) return;
        isLoadingAuditLogs = true;
        try {
            auditLogs = await computeSdk.listDatabaseLogs({ databaseId: database.$id });
        } catch (error) {
            auditLogs = { total: 0, auditLogs: [] };
        } finally {
            isLoadingAuditLogs = false;
        }
    }

    async function loadSchema() {
        if (!database) return;
        isLoadingSchema = true;
        try {
            schema = (await computeSdk.getDatabaseSchema({
                databaseId: database.$id
            })) as Record<string, unknown>;
            schemaLoaded = true;
        } catch (error) {
            schema = null;
            addNotification({
                type: 'error',
                message: `Failed to load schema: ${error.message}`
            });
        } finally {
            isLoadingSchema = false;
        }
    }

    async function handlePreviewSchema() {
        if (!database || !previewSql.trim()) return;
        isLoadingPreview = true;
        try {
            previewResult = (await computeSdk.previewDatabaseSchemaChange({
                databaseId: database.$id,
                sql: previewSql
            })) as Record<string, unknown>;
        } catch (error) {
            previewResult = null;
            addNotification({
                type: 'error',
                message: `Schema preview failed: ${error.message}`
            });
        } finally {
            isLoadingPreview = false;
        }
    }

    async function handleExplainQuery() {
        if (!database || !explainQuery.trim()) return;
        isLoadingExplain = true;
        try {
            explainResult = (await computeSdk.explainDatabaseQuery({
                databaseId: database.$id,
                query: explainQuery,
                analyze: explainAnalyze
            })) as Record<string, unknown>;
        } catch (error) {
            explainResult = null;
            addNotification({
                type: 'error',
                message: `Explain query failed: ${error.message}`
            });
        } finally {
            isLoadingExplain = false;
        }
    }

    async function loadTuning() {
        if (!database) return;
        isLoadingTuning = true;
        try {
            tuningResult = (await computeSdk.getDatabaseTuning({
                databaseId: database.$id
            })) as Record<string, unknown>;
            tuningLoaded = true;
        } catch (error) {
            tuningResult = null;
            addNotification({
                type: 'error',
                message: `Failed to load tuning recommendations: ${error.message}`
            });
        } finally {
            isLoadingTuning = false;
        }
    }

    async function loadIndexSuggestions() {
        if (!database) return;
        isLoadingIndexSuggestions = true;
        try {
            indexSuggestions = (await computeSdk.getDatabaseIndexSuggestions({
                databaseId: database.$id
            })) as Record<string, unknown>;
            indexSuggestionsLoaded = true;
        } catch (error) {
            indexSuggestions = null;
            addNotification({
                type: 'error',
                message: `Failed to load index suggestions: ${error.message}`
            });
        } finally {
            isLoadingIndexSuggestions = false;
        }
    }

    async function refreshAll() {
        trackEvent('dedicated_monitoring_refresh');
        await Promise.all([
            loadMetrics(),
            loadSlowQueries(),
            loadPerformanceInsights(),
            loadAuditLogs()
        ]);
    }

    function formatPercent(value: number | undefined): string {
        if (value === undefined || value === null) return '-';
        return `${value.toFixed(1)}%`;
    }

    function formatNumber(value: number | undefined): string {
        if (value === undefined || value === null) return '-';
        return value.toLocaleString();
    }

    function formatDurationMs(ms: number): string {
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60_000).toFixed(1)}m`;
    }

    function truncateQuery(query: string, maxLen = 120): string {
        if (!query) return '-';
        if (query.length <= maxLen) return query;
        return query.substring(0, maxLen) + '...';
    }

    function formatJson(value: unknown): string {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    }

    function renderEntries(obj: Record<string, unknown>): Array<{ key: string; value: string }> {
        return Object.entries(obj).map(([key, value]) => ({
            key,
            value: typeof value === 'object' ? formatJson(value) : String(value ?? '-')
        }));
    }

    let previousId = $state('');

    $effect(() => {
        void metricsPeriod;
        if (database) {
            loadMetrics();
        }
    });

    $effect(() => {
        if (database && database.$id !== previousId) {
            previousId = database.$id;
            loadSlowQueries();
            loadPerformanceInsights();
            loadAuditLogs();
        }
    });

    $effect(() => {
        if (activeSection === 'schema' && !schemaLoaded && !isLoadingSchema) {
            loadSchema();
        }
    });

    $effect(() => {
        if (activeSection === 'tuning' && !tuningLoaded && !isLoadingTuning) {
            loadTuning();
        }
    });

    $effect(() => {
        if (activeSection === 'indexes' && !indexSuggestionsLoaded && !isLoadingIndexSuggestions) {
            loadIndexSuggestions();
        }
    });
</script>

{#if !database}
    <Container>
        <Alert.Inline status="warning" title="Not available">
            Monitoring is only available for dedicated databases.
        </Alert.Inline>
    </Container>
{:else}
    <Container>
        <Layout.Stack gap="xl">
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Tabs.Root variant="secondary" let:root>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'metrics')}
                        active={activeSection === 'metrics'}>
                        Metrics
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'slowQueries')}
                        active={activeSection === 'slowQueries'}>
                        Slow Queries
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'insights')}
                        active={activeSection === 'insights'}>
                        Performance
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'auditLogs')}
                        active={activeSection === 'auditLogs'}>
                        Audit Logs
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'schema')}
                        active={activeSection === 'schema'}>
                        Schema
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'schemaPreview')}
                        active={activeSection === 'schemaPreview'}>
                        Schema Preview
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'explain')}
                        active={activeSection === 'explain'}>
                        Explain
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'tuning')}
                        active={activeSection === 'tuning'}>
                        Tuning
                    </Tabs.Item.Button>
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (activeSection = 'indexes')}
                        active={activeSection === 'indexes'}>
                        Indexes
                    </Tabs.Item.Button>
                </Tabs.Root>

                {#if activeSection === 'metrics' || activeSection === 'slowQueries' || activeSection === 'insights' || activeSection === 'auditLogs'}
                    <Button secondary on:click={refreshAll}>
                        <Icon icon={IconRefresh} size="s" slot="start" />
                        Refresh
                    </Button>
                {/if}
            </Layout.Stack>

            <!-- Metrics Section -->
            {#if activeSection === 'metrics'}
                <Layout.Stack gap="l">
                    <Tabs.Root variant="secondary" let:root>
                        <Tabs.Item.Button
                            {root}
                            on:click={() => (metricsPeriod = '1h')}
                            active={metricsPeriod === '1h'}>
                            1 Hour
                        </Tabs.Item.Button>
                        <Tabs.Item.Button
                            {root}
                            on:click={() => (metricsPeriod = '24h')}
                            active={metricsPeriod === '24h'}>
                            24 Hours
                        </Tabs.Item.Button>
                        <Tabs.Item.Button
                            {root}
                            on:click={() => (metricsPeriod = '7d')}
                            active={metricsPeriod === '7d'}>
                            7 Days
                        </Tabs.Item.Button>
                        <Tabs.Item.Button
                            {root}
                            on:click={() => (metricsPeriod = '30d')}
                            active={metricsPeriod === '30d'}>
                            30 Days
                        </Tabs.Item.Button>
                    </Tabs.Root>

                    {#if isLoadingMetrics}
                        <Layout.Grid columns={3} columnsS={1} gap="l">
                            {#each Array(6) as _}
                                <Layout.Stack gap="xs">
                                    <Skeleton variant="line" width="60%" height={16} />
                                    <Skeleton variant="line" width="40%" height={24} />
                                </Layout.Stack>
                            {/each}
                        </Layout.Grid>
                    {:else if metrics}
                        <CardGrid>
                            <svelte:fragment slot="title">Resource Utilization</svelte:fragment>
                            CPU, memory, and storage usage for the selected period.
                            <svelte:fragment slot="aside">
                                <Layout.Grid columns={3} columnsS={1} gap="l">
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            CPU Usage
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatPercent(metrics.cpuPercent)}
                                        </Typography.Text>
                                    </Layout.Stack>
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            Memory Usage
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatPercent(metrics.memoryPercent)}
                                        </Typography.Text>
                                        {#if metrics.memoryUsedBytes && metrics.memoryMaxBytes}
                                            <Typography.Caption
                                                variant="400"
                                                color="--fgcolor-neutral-tertiary">
                                                {calculateSize(metrics.memoryUsedBytes)} /
                                                {calculateSize(metrics.memoryMaxBytes)}
                                            </Typography.Caption>
                                        {/if}
                                    </Layout.Stack>
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            Storage Used
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {metrics.storageUsedBytes
                                                ? calculateSize(metrics.storageUsedBytes)
                                                : '-'}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Layout.Grid>
                            </svelte:fragment>
                        </CardGrid>

                        <CardGrid>
                            <svelte:fragment slot="title">Database Activity</svelte:fragment>
                            Connection count, IOPS, and queries per second.
                            <svelte:fragment slot="aside">
                                <Layout.Grid columns={3} columnsS={1} gap="l">
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            Active Connections
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatNumber(metrics.connectionsActive)}
                                            {#if metrics.connectionsMax}
                                                <Typography.Caption
                                                    variant="400"
                                                    color="--fgcolor-neutral-tertiary">
                                                    / {formatNumber(metrics.connectionsMax)}
                                                </Typography.Caption>
                                            {/if}
                                        </Typography.Text>
                                    </Layout.Stack>
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            IOPS (Read)
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatNumber(metrics.iopsRead)}
                                        </Typography.Text>
                                    </Layout.Stack>
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            IOPS (Write)
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatNumber(metrics.iopsWrite)}
                                        </Typography.Text>
                                    </Layout.Stack>
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            Queries per Second
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatNumber(metrics.qps)}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Layout.Grid>
                            </svelte:fragment>
                        </CardGrid>
                    {:else}
                        <Alert.Inline status="info" title="No metrics available">
                            Metrics data is not available for this database. Ensure metrics
                            collection is enabled in the database settings.
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Slow Queries Section -->
            {#if activeSection === 'slowQueries'}
                <Layout.Stack gap="l">
                    <Typography.Text variant="m-500">
                        Queries that exceeded the slow query threshold ({database.metricsSlowQueryLogThresholdMs}ms).
                    </Typography.Text>

                    {#if isLoadingSlowQueries}
                        <Layout.Stack gap="s">
                            {#each Array(3) as _}
                                <Skeleton variant="line" width="100%" height={40} />
                            {/each}
                        </Layout.Stack>
                    {:else if slowQueries.total === 0}
                        <article class="empty card u-width-full-line">
                            No slow queries recorded.
                        </article>
                    {:else}
                        <Table.Root columns={slowQueryColumns} let:root>
                            <svelte:fragment slot="header" let:root>
                                <Table.Header.Cell column="query" {root}>Query</Table.Header.Cell>
                                <Table.Header.Cell column="duration" {root}
                                    >Duration</Table.Header.Cell>
                                <Table.Header.Cell column="calls" {root}>Calls</Table.Header.Cell>
                                <Table.Header.Cell column="user" {root}>User</Table.Header.Cell>
                                <Table.Header.Cell column="database" {root}
                                    >Database</Table.Header.Cell>
                            </svelte:fragment>
                            {#each slowQueries.slowQueries as sq, i}
                                <Table.Row.Base id={`sq-${i}`} {root}>
                                    <Table.Cell column="query" {root}>
                                        <span class="query-text" title={sq.query}>
                                            {truncateQuery(sq.query)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell column="duration" {root}>
                                        {formatDurationMs(sq.durationMs)}
                                    </Table.Cell>
                                    <Table.Cell column="calls" {root}>
                                        {formatNumber(sq.calls)}
                                    </Table.Cell>
                                    <Table.Cell column="user" {root}>
                                        {sq.user}
                                    </Table.Cell>
                                    <Table.Cell column="database" {root}>
                                        {sq.database}
                                    </Table.Cell>
                                </Table.Row.Base>
                            {/each}
                        </Table.Root>
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Performance Insights Section -->
            {#if activeSection === 'insights'}
                <Layout.Stack gap="l">
                    {#if isLoadingInsights}
                        <Layout.Stack gap="s">
                            {#each Array(3) as _}
                                <Skeleton variant="line" width="100%" height={40} />
                            {/each}
                        </Layout.Stack>
                    {:else if performanceInsights}
                        <CardGrid>
                            <svelte:fragment slot="title">Query Summary</svelte:fragment>
                            Aggregated query performance statistics.
                            <svelte:fragment slot="aside">
                                <Layout.Grid columns={3} columnsS={1} gap="l">
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            Total Calls
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatNumber(performanceInsights.totalCalls)}
                                        </Typography.Text>
                                    </Layout.Stack>
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            Total Time
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatDurationMs(performanceInsights.totalTimeMs)}
                                        </Typography.Text>
                                    </Layout.Stack>
                                    <Layout.Stack gap="xxs">
                                        <Typography.Caption
                                            variant="400"
                                            color="--fgcolor-neutral-tertiary">
                                            Average Time
                                        </Typography.Caption>
                                        <Typography.Text variant="m-500">
                                            {formatDurationMs(performanceInsights.avgTimeMs)}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Layout.Grid>
                            </svelte:fragment>
                        </CardGrid>

                        {#if performanceInsights.topQueries.length > 0}
                            <Layout.Stack gap="s">
                                <Typography.Text variant="m-500">
                                    Top Queries by Execution Time
                                </Typography.Text>
                                <Table.Root columns={topQueryColumns} let:root>
                                    <svelte:fragment slot="header" let:root>
                                        <Table.Header.Cell column="query" {root}
                                            >Query</Table.Header.Cell>
                                        <Table.Header.Cell column="calls" {root}
                                            >Calls</Table.Header.Cell>
                                        <Table.Header.Cell column="totalTime" {root}
                                            >Total Time</Table.Header.Cell>
                                        <Table.Header.Cell column="meanTime" {root}
                                            >Mean Time</Table.Header.Cell>
                                        <Table.Header.Cell column="rows" {root}
                                            >Rows</Table.Header.Cell>
                                    </svelte:fragment>
                                    {#each performanceInsights.topQueries as tq, i}
                                        <Table.Row.Base id={`tq-${i}`} {root}>
                                            <Table.Cell column="query" {root}>
                                                <span class="query-text" title={tq.query}>
                                                    {truncateQuery(tq.query)}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell column="calls" {root}>
                                                {formatNumber(tq.calls)}
                                            </Table.Cell>
                                            <Table.Cell column="totalTime" {root}>
                                                {formatDurationMs(tq.totalTimeMs)}
                                            </Table.Cell>
                                            <Table.Cell column="meanTime" {root}>
                                                {formatDurationMs(tq.meanTimeMs)}
                                            </Table.Cell>
                                            <Table.Cell column="rows" {root}>
                                                {formatNumber(tq.rows)}
                                            </Table.Cell>
                                        </Table.Row.Base>
                                    {/each}
                                </Table.Root>
                            </Layout.Stack>
                        {/if}

                        {#if performanceInsights.waitEvents.length > 0}
                            <Layout.Stack gap="s">
                                <Typography.Text variant="m-500">
                                    Wait Events Analysis
                                </Typography.Text>
                                <Table.Root columns={waitEventColumns} let:root>
                                    <svelte:fragment slot="header" let:root>
                                        <Table.Header.Cell column="event" {root}
                                            >Event</Table.Header.Cell>
                                        <Table.Header.Cell column="type" {root}
                                            >Type</Table.Header.Cell>
                                        <Table.Header.Cell column="count" {root}
                                            >Count</Table.Header.Cell>
                                        <Table.Header.Cell column="totalWait" {root}
                                            >Total Wait</Table.Header.Cell>
                                    </svelte:fragment>
                                    {#each performanceInsights.waitEvents as we, i}
                                        <Table.Row.Base id={`we-${i}`} {root}>
                                            <Table.Cell column="event" {root}>
                                                {we.event}
                                            </Table.Cell>
                                            <Table.Cell column="type" {root}>
                                                {we.type}
                                            </Table.Cell>
                                            <Table.Cell column="count" {root}>
                                                {formatNumber(we.count)}
                                            </Table.Cell>
                                            <Table.Cell column="totalWait" {root}>
                                                {formatDurationMs(we.totalWaitMs)}
                                            </Table.Cell>
                                        </Table.Row.Base>
                                    {/each}
                                </Table.Root>
                            </Layout.Stack>
                        {/if}
                    {:else}
                        <Alert.Inline status="info" title="No insights available">
                            Performance insights data is not available. Ensure metrics collection is
                            enabled and the database has been active.
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Audit Logs Section -->
            {#if activeSection === 'auditLogs'}
                <Layout.Stack gap="l">
                    <Typography.Text variant="m-500">Database audit log entries.</Typography.Text>

                    {#if isLoadingAuditLogs}
                        <Layout.Stack gap="s">
                            {#each Array(3) as _}
                                <Skeleton variant="line" width="100%" height={40} />
                            {/each}
                        </Layout.Stack>
                    {:else if auditLogs.total === 0}
                        <article class="empty card u-width-full-line">
                            No audit log entries recorded.
                        </article>
                    {:else}
                        <Table.Root columns={auditLogColumns} let:root>
                            <svelte:fragment slot="header" let:root>
                                <Table.Header.Cell column="timestamp" {root}
                                    >Timestamp</Table.Header.Cell>
                                <Table.Header.Cell column="user" {root}>User</Table.Header.Cell>
                                <Table.Header.Cell column="action" {root}>Action</Table.Header.Cell>
                                <Table.Header.Cell column="object" {root}>Object</Table.Header.Cell>
                                <Table.Header.Cell column="statement" {root}
                                    >Statement</Table.Header.Cell>
                                <Table.Header.Cell column="client" {root}>Client</Table.Header.Cell>
                            </svelte:fragment>
                            {#each auditLogs.auditLogs as log, i}
                                <Table.Row.Base id={`al-${i}`} {root}>
                                    <Table.Cell column="timestamp" {root}>
                                        {log.timestamp ? toLocaleDateTime(log.timestamp) : '-'}
                                    </Table.Cell>
                                    <Table.Cell column="user" {root}>
                                        {log.user}
                                    </Table.Cell>
                                    <Table.Cell column="action" {root}>
                                        <Badge variant="secondary" size="s" content={log.action} />
                                    </Table.Cell>
                                    <Table.Cell column="object" {root}>
                                        {log.object || '-'}
                                    </Table.Cell>
                                    <Table.Cell column="statement" {root}>
                                        <span class="query-text" title={log.statement}>
                                            {truncateQuery(log.statement, 80)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell column="client" {root}>
                                        {log.clientAddress || '-'}
                                    </Table.Cell>
                                </Table.Row.Base>
                            {/each}
                        </Table.Root>
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Schema Section -->
            {#if activeSection === 'schema'}
                <Layout.Stack gap="l">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Typography.Text variant="m-500">
                            Current database schema (tables, columns, types, constraints, and
                            indexes).
                        </Typography.Text>
                        <Button secondary on:click={loadSchema}>
                            <Icon icon={IconRefresh} size="s" slot="start" />
                            Refresh
                        </Button>
                    </Layout.Stack>

                    {#if isLoadingSchema}
                        <Layout.Stack gap="s">
                            {#each Array(5) as _}
                                <Skeleton variant="line" width="100%" height={20} />
                            {/each}
                        </Layout.Stack>
                    {:else if schema}
                        <Code language="json" code={formatJson(schema)} withCopy />
                    {:else}
                        <Alert.Inline status="info" title="No schema available">
                            Schema data is not available for this database.
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Schema Preview Section -->
            {#if activeSection === 'schemaPreview'}
                <Layout.Stack gap="l">
                    <Typography.Text variant="m-500">
                        Preview the impact of a SQL schema change without applying it.
                    </Typography.Text>

                    <Alert.Inline status="info" title="Dry run">
                        This performs a dry-run analysis only. No changes will be applied to your
                        database.
                    </Alert.Inline>

                    <InputTextarea
                        id="preview-sql"
                        label="SQL Statement"
                        placeholder="ALTER TABLE users ADD COLUMN email VARCHAR(255);"
                        rows={4}
                        bind:value={previewSql} />

                    <Layout.Stack direction="row" gap="s">
                        <Button
                            secondary
                            disabled={!previewSql.trim() || isLoadingPreview}
                            on:click={handlePreviewSchema}>
                            {isLoadingPreview ? 'Analyzing...' : 'Preview Changes'}
                        </Button>
                        {#if previewResult}
                            <Button
                                text
                                on:click={() => {
                                    previewResult = null;
                                    previewSql = '';
                                }}>
                                Clear
                            </Button>
                        {/if}
                    </Layout.Stack>

                    {#if previewResult}
                        <Code language="json" code={formatJson(previewResult)} withCopy />
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Explain Query Section -->
            {#if activeSection === 'explain'}
                <Layout.Stack gap="l">
                    <Typography.Text variant="m-500">
                        Run EXPLAIN on a SQL query to view its execution plan.
                    </Typography.Text>

                    <InputTextarea
                        id="explain-sql"
                        label="SQL Query"
                        placeholder="SELECT * FROM users WHERE email = 'test@example.com';"
                        rows={4}
                        bind:value={explainQuery} />

                    <Layout.Stack gap="s">
                        <InputChoice
                            type="checkbox"
                            id="explain-analyze"
                            label="Run EXPLAIN ANALYZE (executes the query to get actual statistics)"
                            bind:value={explainAnalyze} />
                        {#if explainAnalyze}
                            <Alert.Inline status="warning" title="Warning">
                                EXPLAIN ANALYZE will execute the query against your database. Use
                                with caution on write operations.
                            </Alert.Inline>
                        {/if}
                    </Layout.Stack>

                    <Layout.Stack direction="row" gap="s">
                        <Button
                            secondary
                            disabled={!explainQuery.trim() || isLoadingExplain}
                            on:click={handleExplainQuery}>
                            {isLoadingExplain ? 'Running...' : 'Explain'}
                        </Button>
                        {#if explainResult}
                            <Button
                                text
                                on:click={() => {
                                    explainResult = null;
                                    explainQuery = '';
                                    explainAnalyze = false;
                                }}>
                                Clear
                            </Button>
                        {/if}
                    </Layout.Stack>

                    {#if explainResult}
                        <Code language="json" code={formatJson(explainResult)} withCopy />
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Tuning Section -->
            {#if activeSection === 'tuning'}
                <Layout.Stack gap="l">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Typography.Text variant="m-500">
                            Configuration tuning recommendations based on workload analysis.
                        </Typography.Text>
                        <Button
                            secondary
                            on:click={() => {
                                tuningLoaded = false;
                                loadTuning();
                            }}>
                            <Icon icon={IconRefresh} size="s" slot="start" />
                            Refresh
                        </Button>
                    </Layout.Stack>

                    {#if isLoadingTuning}
                        <Layout.Stack gap="s">
                            {#each Array(4) as _}
                                <Skeleton variant="line" width="100%" height={40} />
                            {/each}
                        </Layout.Stack>
                    {:else if tuningResult}
                        {@const entries = renderEntries(tuningResult)}
                        {#if entries.length === 0}
                            <Alert.Inline status="info" title="No recommendations">
                                No tuning recommendations at this time. Your configuration looks
                                good.
                            </Alert.Inline>
                        {:else}
                            <Table.Root
                                columns={[
                                    { id: 'parameter', width: { min: 200 } },
                                    { id: 'recommendation', width: { min: 300 } }
                                ]}
                                let:root>
                                <svelte:fragment slot="header" let:root>
                                    <Table.Header.Cell column="parameter" {root}
                                        >Parameter</Table.Header.Cell>
                                    <Table.Header.Cell column="recommendation" {root}
                                        >Recommendation</Table.Header.Cell>
                                </svelte:fragment>
                                {#each entries as entry, i}
                                    <Table.Row.Base id={`tuning-${i}`} {root}>
                                        <Table.Cell column="parameter" {root}>
                                            <span class="query-text">{entry.key}</span>
                                        </Table.Cell>
                                        <Table.Cell column="recommendation" {root}>
                                            <span class="query-text">{entry.value}</span>
                                        </Table.Cell>
                                    </Table.Row.Base>
                                {/each}
                            </Table.Root>
                        {/if}
                    {:else}
                        <Alert.Inline status="info" title="No tuning data">
                            Tuning recommendations are not available. Ensure the database has been
                            active with sufficient workload data.
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            {/if}

            <!-- Index Suggestions Section -->
            {#if activeSection === 'indexes'}
                <Layout.Stack gap="l">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Typography.Text variant="m-500">
                            Index suggestions based on query patterns and table statistics.
                        </Typography.Text>
                        <Button
                            secondary
                            on:click={() => {
                                indexSuggestionsLoaded = false;
                                loadIndexSuggestions();
                            }}>
                            <Icon icon={IconRefresh} size="s" slot="start" />
                            Refresh
                        </Button>
                    </Layout.Stack>

                    {#if isLoadingIndexSuggestions}
                        <Layout.Stack gap="s">
                            {#each Array(3) as _}
                                <Skeleton variant="line" width="100%" height={40} />
                            {/each}
                        </Layout.Stack>
                    {:else if indexSuggestions}
                        {@const entries = renderEntries(indexSuggestions)}
                        {#if entries.length === 0}
                            <Alert.Inline status="info" title="No suggestions">
                                No index suggestions at this time. Your indexes appear to be
                                well-optimized.
                            </Alert.Inline>
                        {:else}
                            <Code language="json" code={formatJson(indexSuggestions)} withCopy />
                        {/if}
                    {:else}
                        <Alert.Inline status="info" title="No index data">
                            Index suggestions are not available. Ensure the database has been active
                            with sufficient query history.
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            {/if}
        </Layout.Stack>
    </Container>
{/if}

<style>
    .empty {
        block-size: 200px;
        text-align: center;
        align-content: center;
    }

    .query-text {
        font-family: var(--font-family-code, monospace);
        font-size: var(--font-size-xs);
        word-break: break-all;
        max-width: 400px;
        display: inline-block;
    }
</style>
