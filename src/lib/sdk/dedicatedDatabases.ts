import type { Client } from '@appwrite.io/console';

// ── Enums ──────────────────────────────────────────────────────────────────

export type DatabaseEngine = 'postgres' | 'mysql' | 'mariadb' | 'mongodb';
export type DatabaseTypeValue = 'shared' | 'dedicated';
export type DatabaseBackend = 'appwrite' | 'edge';
export type DatabaseStatusValue =
    | 'provisioning'
    | 'ready'
    | 'active'
    | 'inactive'
    | 'paused'
    | 'failed'
    | 'deleted'
    | 'restoring'
    | 'scaling';
export type ContainerStatusValue =
    | 'inactive'
    | 'starting'
    | 'running'
    | 'active'
    | 'spinning_down'
    | 'freezing'
    | null;
export type StorageClass = 'ssd' | 'nvme' | 'hdd';
export type BackupType = 'full' | 'incremental' | 'wal';
export type BackupStatusValue = 'pending' | 'running' | 'completed' | 'failed' | 'verified';
export type BackupStorageProvider = 's3' | 'gcs' | 'azure';
export type RestorationType = 'backup' | 'pitr';
export type RestorationStatusValue = 'pending' | 'running' | 'completed' | 'failed';
export type HASyncMode = 'async' | 'sync' | 'quorum';
export type ReplicaRole = 'primary' | 'standby' | 'readReplica';
export type MaintenanceDay = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type DataResidency = 'eu' | 'us' | 'apac' | 'global';
export type KeyManagement = 'appwriteKms' | 'customerManaged';
export type UpgradePolicy = 'autoMinor' | 'manual' | 'scheduled';
export type PoolerMode = 'transaction' | 'session';
export type ConnectionRole = 'readonly' | 'readwrite';

export type Capability =
    | 'pitr'
    | 'ha'
    | 'coldStart'
    | 'pause'
    | 'scaling'
    | 'storageScaling'
    | 'backupCreate'
    | 'backupRestore'
    | 'backupVerification'
    | 'connections'
    | 'usageMetrics'
    | 'versionUpgrade'
    | 'maintenanceWindow'
    | 'extensions'
    | 'connectionPooler'
    | 'ipAllowlist'
    | 'slowQueryLog'
    | 'auditLog'
    | 'credentialRotation'
    | 'failover'
    | 'crossRegionFailover'
    | 'multiRegionReplica'
    | 'backupOffCluster'
    | 'performanceInsights';

// ── Response Types ─────────────────────────────────────────────────────────

export type DedicatedDatabase = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    projectId: string;
    name: string;
    engine: DatabaseEngine;
    version: string;
    type: DatabaseTypeValue;
    region: string;
    tier: string;
    backend: DatabaseBackend;
    cpu: number;
    memory: number;
    storage: number;
    storageClass: StorageClass;
    maxStorageGb: number;
    hostname: string;
    connectionPort: number;
    connectionUser: string;
    connectionPassword: string;
    connectionString: string;
    status: DatabaseStatusValue;
    externalIP: string;
    internalIP: string;
    containerStatus: ContainerStatusValue;
    lastActivityAt: string;
    idleUntil: string;
    idleTimeoutMinutes: number | null;
    highAvailability: boolean;
    haReplicaCount: number;
    haSyncMode: HASyncMode | null;
    networkMaxConnections: number;
    networkIdleTimeoutSeconds: number;
    networkIPAllowlist: string[];
    networkPublicTcp: boolean;
    backupEnabled: boolean;
    backupPitr: boolean;
    backupCron: string;
    backupRetentionDays: number;
    pitrRetentionDays: number;
    storageAutoscaling: boolean;
    storageAutoscalingThresholdPercent: number;
    storageAutoscalingMaxGb: number;
    maintenanceWindowDay: MaintenanceDay;
    maintenanceWindowHourUtc: number;
    maintenanceWindowDurationMinutes: number;
    maintenanceUpgradePolicy: UpgradePolicy;
    metricsEnabled: boolean;
    metricsSlowQueryLogThresholdMs: number;
    metricsTraceSampleRate: number;
    securityEncryptionAtRest: boolean;
    securityKeyManagement: KeyManagement;
    securityKeyRotationDays: number;
    securityCMKKeyId: string;
    securityAuditLogEnabled: boolean;
    securityLogRetentionDays: number;
    securityDataResidency: DataResidency;
    sqlApiEnabled: boolean;
    sqlApiAllowedStatements: string[];
    sqlApiMaxBytes: number;
    sqlApiMaxRows: number;
    sqlApiTimeoutSeconds: number;
    lastMetricsPollAt: number;
    error?: string;
};

export type DedicatedDatabaseList = {
    total: number;
    databases: DedicatedDatabase[];
};

export type DedicatedDatabaseCredentials = {
    $id: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    engine: DatabaseEngine;
    ssl: boolean;
    connectionString: string;
};

export type DatabaseConnection = {
    $id: string;
    username: string;
    database: string;
    role: ConnectionRole;
    $createdAt: string;
};

export type DatabaseConnectionList = {
    total: number;
    connections: DatabaseConnection[];
};

export type Backup = {
    $id: string;
    $createdAt: string;
    databaseId: string;
    projectId: string;
    type: BackupType;
    status: BackupStatusValue;
    sizeBytes: number;
    startedAt: number;
    completedAt: number;
    verifiedAt: number;
    expiresAt: number;
    error?: string;
};

export type BackupList = {
    total: number;
    backups: Backup[];
};

export type Restoration = {
    $id: string;
    $createdAt: string;
    databaseId: string;
    projectId: string;
    backupId: string | null;
    type: RestorationType;
    status: RestorationStatusValue;
    targetTime: number | null;
    startedAt: number;
    completedAt: number;
    error?: string;
};

export type RestorationList = {
    total: number;
    restorations: Restoration[];
};

export type HAStatusReplica = {
    $id: string;
    role: 'primary' | 'replica';
    status: 'healthy' | 'degraded' | 'unhealthy';
    lagSeconds: number;
};

export type HAStatus = {
    enabled: boolean;
    replicaCount: number;
    syncMode: HASyncMode;
    replicas: HAStatusReplica[];
};

export type ReadReplica = {
    $id: string;
    databaseId: string;
    targetRegion: string;
    sourceRegion: string;
    status: 'provisioning' | 'active' | 'degraded' | 'failed' | 'deleting';
    lagSeconds: number;
    hostname: string;
    externalIP: string;
    crossZoneConsent: boolean;
    $createdAt: string;
};

export type ReadReplicaList = {
    total: number;
    replicas: ReadReplica[];
};

export type CrossRegionStatus = {
    enabled: boolean;
    primaryRegion: string;
    standbyRegion: string;
    standbyStatus: 'healthy' | 'degraded' | 'unhealthy' | 'provisioning';
    lagSeconds: number;
    lastSyncedAt: string;
};

export type PoolerConfig = {
    enabled: boolean;
    mode: PoolerMode;
    maxConnections: number;
    defaultPoolSize: number;
    port: number;
};

export type BackupStorageConfig = {
    provider: BackupStorageProvider;
    bucket: string;
    region: string;
    prefix: string;
    endpoint: string;
};

export type ActiveConnection = {
    pid: number;
    user: string;
    database: string;
    state: 'active' | 'idle' | 'idle in transaction';
    query: string;
    connectedAt: string;
    waitEvent: string;
};

export type ActiveConnectionList = {
    total: number;
    activeConnections: ActiveConnection[];
};

export type DatabaseMetrics = {
    period: string;
    cpuPercent: number;
    memoryPercent: number;
    memoryUsedBytes: number;
    memoryMaxBytes: number;
    storageUsedBytes: number;
    connectionsActive: number;
    connectionsMax: number;
    iopsRead: number;
    iopsWrite: number;
    qps: number;
};

export type PerformanceInsightsQuery = {
    query: string;
    calls: number;
    totalTimeMs: number;
    meanTimeMs: number;
    rows: number;
};

export type PerformanceInsightsWaitEvent = {
    event: string;
    type: string;
    count: number;
    totalWaitMs: number;
};

export type PerformanceInsights = {
    topQueries: PerformanceInsightsQuery[];
    waitEvents: PerformanceInsightsWaitEvent[];
    totalCalls: number;
    totalTimeMs: number;
    avgTimeMs: number;
};

export type PITRWindows = {
    earliest: string;
    latest: string;
};

export type AuditLog = {
    timestamp: string;
    user: string;
    database: string;
    action: string;
    object: string;
    statement: string;
    clientAddress: string;
};

export type AuditLogList = {
    total: number;
    auditLogs: AuditLog[];
};

export type SlowQuery = {
    query: string;
    durationMs: number;
    calls: number;
    user: string;
    database: string;
};

export type SlowQueryList = {
    total: number;
    slowQueries: SlowQuery[];
};

export type DatabaseExtensions = {
    installed: string[];
    available: string[];
};

export type DatabaseStatusDetail = {
    health: 'healthy' | 'degraded' | 'unhealthy';
    ready: boolean;
    engine: DatabaseEngine;
    version: string;
    uptime: number;
    connections: {
        current: number;
        max: number;
    };
    replicas: {
        index: number;
        role: 'primary' | 'replica';
        healthy: boolean;
        lagSeconds: number;
    }[];
    volumes: {
        path: string;
        usedPercent: string;
        available: string;
        mounted: boolean;
    }[];
};

// ── Request Params ─────────────────────────────────────────────────────────

export type CreateDedicatedDatabaseParams = {
    databaseId: string;
    name: string;
    engine?: DatabaseEngine;
    version?: string;
    region?: string;
    type?: DatabaseTypeValue;
    tier?: string;
    backend: DatabaseBackend;
    cpu?: number;
    memory?: number;
    storage?: number;
    storageClass?: StorageClass;
    maxStorageGb?: number;
    highAvailability?: boolean;
    haReplicaCount?: number;
    haSyncMode?: HASyncMode;
    networkMaxConnections?: number;
    networkIdleTimeoutSeconds?: number;
    networkIPAllowlist?: string[];
    idleTimeoutMinutes?: number;
    backupEnabled?: boolean;
    backupPitr?: boolean;
    backupSchedule?: string;
    backupRetentionDays?: number;
    pitrRetentionDays?: number;
    storageAutoscaling?: boolean;
    storageAutoscalingThresholdPercent?: number;
    storageAutoscalingMaxGb?: number;
    metricsEnabled?: boolean;
};

export type UpdateDedicatedDatabaseParams = {
    name?: string;
    status?: 'paused' | 'active' | 'inactive' | 'ready';
    cpu?: number;
    memory?: number;
    storage?: number;
    storageClass?: StorageClass;
    highAvailability?: boolean;
    haReplicaCount?: number;
    haSyncMode?: HASyncMode;
    networkMaxConnections?: number;
    networkIdleTimeoutSeconds?: number;
    networkIPAllowlist?: string[];
    idleTimeoutMinutes?: number;
    backupEnabled?: boolean;
    backupPitr?: boolean;
    backupCron?: string;
    backupRetentionDays?: number;
    pitrRetentionDays?: number;
    storageAutoscaling?: boolean;
    storageAutoscalingThresholdPercent?: number;
    storageAutoscalingMaxGb?: number;
    metricsEnabled?: boolean;
    securityAuditLogEnabled?: boolean;
    securityLogRetentionDays?: number;
    sqlApiEnabled?: boolean;
    sqlApiMaxBytes?: number;
    sqlApiMaxRows?: number;
    sqlApiTimeoutSeconds?: number;
    sqlApiAllowedStatements?: string[];
};

// ── Helpers ────────────────────────────────────────────────────────────────

const JSON_HEADERS = { 'content-type': 'application/json' } as const;

function filterUndefined(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}

// ── SDK Class ──────────────────────────────────────────────────────────────

export class DedicatedDatabases {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    private uri(path: string): URL {
        return new URL(this.client.config.endpoint + path);
    }

    // ── Database CRUD ──────────────────────────────────────────────────

    async create(params: CreateDedicatedDatabaseParams): Promise<DedicatedDatabase> {
        return await this.client.call('POST', this.uri('/compute/databases'), JSON_HEADERS, {
            databaseId: params.databaseId,
            name: params.name,
            engine: params.engine ?? 'postgres',
            version: params.version,
            region: params.region ?? 'fra',
            type: params.type ?? 'shared',
            tier: params.tier ?? 'starter',
            backend: params.backend,
            cpu: params.cpu,
            memory: params.memory,
            storage: params.storage,
            storageClass: params.storageClass,
            maxStorageGb: params.maxStorageGb,
            highAvailability: params.highAvailability,
            haReplicaCount: params.haReplicaCount,
            haSyncMode: params.haSyncMode,
            networkMaxConnections: params.networkMaxConnections,
            networkIdleTimeoutSeconds: params.networkIdleTimeoutSeconds,
            networkIPAllowlist: params.networkIPAllowlist,
            idleTimeoutMinutes: params.idleTimeoutMinutes,
            backupEnabled: params.backupEnabled,
            backupPitr: params.backupPitr,
            backupCron: params.backupSchedule,
            backupRetentionDays: params.backupRetentionDays,
            pitrRetentionDays: params.pitrRetentionDays,
            storageAutoscaling: params.storageAutoscaling,
            storageAutoscalingThresholdPercent: params.storageAutoscalingThresholdPercent,
            storageAutoscalingMaxGb: params.storageAutoscalingMaxGb,
            metricsEnabled: params.metricsEnabled
        });
    }

    async get(databaseId: string): Promise<DedicatedDatabase> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}`),
            JSON_HEADERS
        );
    }

    async list(queries: string[] = [], search?: string): Promise<DedicatedDatabaseList> {
        const params: Record<string, unknown> = {};
        if (queries.length > 0) params.queries = queries;
        if (search) params.search = search;
        return await this.client.call(
            'GET',
            this.uri('/compute/databases'),
            JSON_HEADERS,
            params
        );
    }

    async update(
        databaseId: string,
        params: UpdateDedicatedDatabaseParams
    ): Promise<DedicatedDatabase> {
        return await this.client.call(
            'PATCH',
            this.uri(`/compute/databases/${databaseId}`),
            JSON_HEADERS,
            filterUndefined(params)
        );
    }

    async delete(params: { databaseId: string }): Promise<void> {
        return await this.client.call(
            'DELETE',
            this.uri(`/compute/databases/${params.databaseId}`),
            JSON_HEADERS
        );
    }

    // ── Lifecycle ──────────────────────────────────────────────────────

    async migrate(databaseId: string): Promise<DedicatedDatabase> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/migrations`),
            JSON_HEADERS
        );
    }

    async upgradeVersion(databaseId: string, targetVersion: string): Promise<DedicatedDatabase> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/upgrades`),
            JSON_HEADERS,
            { targetVersion }
        );
    }

    async updateActivity(
        databaseId: string,
        params?: { inboundBytes?: number; outboundBytes?: number }
    ): Promise<DedicatedDatabase> {
        return await this.client.call(
            'PATCH',
            this.uri(`/compute/databases/${databaseId}/activity`),
            JSON_HEADERS,
            params ? filterUndefined(params) : undefined
        );
    }

    // ── Status ─────────────────────────────────────────────────────────

    async getStatus(databaseId: string): Promise<DatabaseStatusDetail> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/status`),
            JSON_HEADERS
        );
    }

    // ── Credentials ────────────────────────────────────────────────────

    async getCredentials(databaseId: string): Promise<DedicatedDatabaseCredentials> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/credentials`),
            JSON_HEADERS
        );
    }

    async rotateCredentials(databaseId: string): Promise<DedicatedDatabaseCredentials> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/credentials`),
            JSON_HEADERS
        );
    }

    // ── Connections (Database Users) ───────────────────────────────────

    async createConnection(
        databaseId: string,
        username: string,
        role: ConnectionRole = 'readwrite'
    ): Promise<DatabaseConnection> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/connections`),
            JSON_HEADERS,
            { username, role }
        );
    }

    async listConnections(databaseId: string): Promise<DatabaseConnectionList> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/connections`),
            JSON_HEADERS
        );
    }

    async deleteConnection(databaseId: string, connectionId: string): Promise<void> {
        return await this.client.call(
            'DELETE',
            this.uri(`/compute/databases/${databaseId}/connections/${connectionId}`),
            JSON_HEADERS
        );
    }

    async getActiveConnections(databaseId: string): Promise<ActiveConnectionList> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/active-connections`),
            JSON_HEADERS
        );
    }

    // ── Extensions (PostgreSQL) ────────────────────────────────────────

    async createExtension(databaseId: string, name: string): Promise<DatabaseExtensions> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/extensions`),
            JSON_HEADERS,
            { name }
        );
    }

    async listExtensions(databaseId: string): Promise<DatabaseExtensions> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/extensions`),
            JSON_HEADERS
        );
    }

    async deleteExtension(databaseId: string, extensionName: string): Promise<void> {
        return await this.client.call(
            'DELETE',
            this.uri(`/compute/databases/${databaseId}/extensions/${extensionName}`),
            JSON_HEADERS
        );
    }

    // ── Connection Pooler ──────────────────────────────────────────────

    async getPoolerConfig(databaseId: string): Promise<PoolerConfig> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/pooler`),
            JSON_HEADERS
        );
    }

    async updatePoolerConfig(
        databaseId: string,
        params: { mode?: PoolerMode; maxConnections?: number; defaultPoolSize?: number }
    ): Promise<PoolerConfig> {
        return await this.client.call(
            'PATCH',
            this.uri(`/compute/databases/${databaseId}/pooler`),
            JSON_HEADERS,
            filterUndefined(params)
        );
    }

    // ── High Availability ──────────────────────────────────────────────

    async getHAStatus(databaseId: string): Promise<HAStatus> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/ha`),
            JSON_HEADERS
        );
    }

    async createFailover(databaseId: string, targetReplicaId?: string): Promise<void> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/ha/failovers`),
            JSON_HEADERS,
            targetReplicaId ? { targetReplicaId } : undefined
        );
    }

    // ── Cross-Region Failover ──────────────────────────────────────────

    async enableCrossRegion(
        databaseId: string,
        standbyRegion: string
    ): Promise<CrossRegionStatus> {
        return await this.client.call(
            'PUT',
            this.uri(`/compute/databases/${databaseId}/cross-region`),
            JSON_HEADERS,
            { standbyRegion }
        );
    }

    async disableCrossRegion(databaseId: string): Promise<void> {
        return await this.client.call(
            'DELETE',
            this.uri(`/compute/databases/${databaseId}/cross-region`),
            JSON_HEADERS
        );
    }

    async getCrossRegionStatus(databaseId: string): Promise<CrossRegionStatus> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/cross-region`),
            JSON_HEADERS
        );
    }

    async triggerCrossRegionFailover(databaseId: string): Promise<void> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/cross-region/failovers`),
            JSON_HEADERS
        );
    }

    // ── Read Replicas ──────────────────────────────────────────────────

    async createReadReplica(
        databaseId: string,
        targetRegion: string,
        crossZoneConsent: boolean = false
    ): Promise<ReadReplica> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/replicas`),
            JSON_HEADERS,
            { targetRegion, crossZoneConsent }
        );
    }

    async listReadReplicas(databaseId: string): Promise<ReadReplicaList> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/replicas`),
            JSON_HEADERS
        );
    }

    async deleteReadReplica(databaseId: string, replicaId: string): Promise<void> {
        return await this.client.call(
            'DELETE',
            this.uri(`/compute/databases/${databaseId}/replicas/${replicaId}`),
            JSON_HEADERS
        );
    }

    async getReadReplica(databaseId: string, replicaId: string): Promise<ReadReplica> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/replicas/${replicaId}`),
            JSON_HEADERS
        );
    }

    // ── Backups ────────────────────────────────────────────────────────

    async createBackup(
        databaseId: string,
        type: 'full' | 'incremental' = 'full'
    ): Promise<Backup> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/backups`),
            JSON_HEADERS,
            { type }
        );
    }

    async listBackups(
        databaseId: string,
        params?: {
            status?: BackupStatusValue;
            type?: BackupType;
            limit?: number;
            offset?: number;
        }
    ): Promise<BackupList> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/backups`),
            JSON_HEADERS,
            params ? filterUndefined(params) : undefined
        );
    }

    async getBackup(databaseId: string, backupId: string): Promise<Backup> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/backups/${backupId}`),
            JSON_HEADERS
        );
    }

    async deleteBackup(databaseId: string, backupId: string): Promise<void> {
        return await this.client.call(
            'DELETE',
            this.uri(`/compute/databases/${databaseId}/backups/${backupId}`),
            JSON_HEADERS
        );
    }

    // ── Restorations ───────────────────────────────────────────────────

    async createRestoration(databaseId: string, backupId: string): Promise<Restoration> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/restorations`),
            JSON_HEADERS,
            { type: 'backup', backupId }
        );
    }

    async createPITRRestoration(databaseId: string, targetTime: number): Promise<Restoration> {
        return await this.client.call(
            'POST',
            this.uri(`/compute/databases/${databaseId}/restorations`),
            JSON_HEADERS,
            { type: 'pitr', targetTime }
        );
    }

    async listRestorations(
        databaseId: string,
        params?: {
            status?: RestorationStatusValue;
            type?: RestorationType;
            limit?: number;
            offset?: number;
        }
    ): Promise<RestorationList> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/restorations`),
            JSON_HEADERS,
            params ? filterUndefined(params) : undefined
        );
    }

    async getRestoration(databaseId: string, restorationId: string): Promise<Restoration> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/restorations/${restorationId}`),
            JSON_HEADERS
        );
    }

    // ── PITR ───────────────────────────────────────────────────────────

    async getPITRWindows(databaseId: string): Promise<PITRWindows> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/pitr-windows`),
            JSON_HEADERS
        );
    }

    // ── Metrics & Monitoring ───────────────────────────────────────────

    async getMetrics(
        databaseId: string,
        period: '1h' | '24h' | '7d' | '30d' = '24h'
    ): Promise<DatabaseMetrics> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/metrics`),
            JSON_HEADERS,
            { period }
        );
    }

    async getSlowQueries(
        databaseId: string,
        params?: { limit?: number; thresholdMs?: number }
    ): Promise<SlowQueryList> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/slow-queries`),
            JSON_HEADERS,
            params ? filterUndefined(params) : undefined
        );
    }

    async getPerformanceInsights(
        databaseId: string,
        params?: { period?: '1h' | '24h' | '7d'; limit?: number }
    ): Promise<PerformanceInsights> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/performance-insights`),
            JSON_HEADERS,
            params ? filterUndefined(params) : undefined
        );
    }

    async getAuditLogs(
        databaseId: string,
        params?: { startTime?: string; endTime?: string; limit?: number }
    ): Promise<AuditLogList> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/audit-logs`),
            JSON_HEADERS,
            params ? filterUndefined(params) : undefined
        );
    }

    // ── Maintenance ────────────────────────────────────────────────────

    async updateMaintenance(
        databaseId: string,
        params: {
            day: MaintenanceDay;
            hourUtc: number;
            durationMinutes?: number;
        }
    ): Promise<DedicatedDatabase> {
        return await this.client.call(
            'PATCH',
            this.uri(`/compute/databases/${databaseId}/maintenance`),
            JSON_HEADERS,
            filterUndefined(params)
        );
    }

    // ── Backup Storage (Off-Cluster) ───────────────────────────────────

    async configureBackupStorage(
        databaseId: string,
        params: {
            provider: BackupStorageProvider;
            bucket: string;
            region: string;
            accessKeyId: string;
            secretAccessKey: string;
            prefix?: string;
            endpoint?: string;
        }
    ): Promise<BackupStorageConfig> {
        return await this.client.call(
            'PUT',
            this.uri(`/compute/databases/${databaseId}/backup-storage`),
            JSON_HEADERS,
            params
        );
    }

    async getBackupStorageConfig(databaseId: string): Promise<BackupStorageConfig> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/backup-storage`),
            JSON_HEADERS
        );
    }

    async deleteBackupStorageConfig(databaseId: string): Promise<void> {
        return await this.client.call(
            'DELETE',
            this.uri(`/compute/databases/${databaseId}/backup-storage`),
            JSON_HEADERS
        );
    }

    // ── Usage ──────────────────────────────────────────────────────────

    async getUsage(
        databaseId: string,
        range: '24h' | '30d' | '90d' = '24h'
    ): Promise<Record<string, unknown>> {
        return await this.client.call(
            'GET',
            this.uri(`/compute/databases/${databaseId}/usage`),
            JSON_HEADERS,
            { range }
        );
    }
}
