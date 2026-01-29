import type { Client } from '@appwrite.io/console';

export type DedicatedDatabase = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    engine: 'postgres' | 'mysql' | 'mariadb';
    version: string;
    type: 'shared' | 'dedicated';
    region: string;
    tier: string;
    backend: 'prisma' | 'appwrite';
    cpu: number;
    memory: number;
    storage: number;
    storageClass: string;
    hostname: string;
    connectionPort: number;
    connectionUser: string;
    connectionPassword: string;
    connectionString: string;
    status: 'provisioning' | 'ready' | 'inactive' | 'paused' | 'failed' | 'deleted' | 'restoring' | 'scaling';
    containerStatus: 'inactive' | 'starting' | 'running' | 'active' | null;
    highAvailability: boolean;
    haReplicaCount: number;
    haSyncMode: string | null;
    networkMaxConnections: number;
    networkIdleTimeoutSeconds: number;
    networkIPAllowlist: string[];
    idleTimeoutMinutes: number | null;
    backupEnabled: boolean;
    backupPitr: boolean;
    backupCron: string;
    backupRetentionDays: number;
    metricsEnabled: boolean;
    error?: string;
};

export type DedicatedDatabaseList = {
    total: number;
    databases: DedicatedDatabase[];
};

export type DedicatedDatabaseCredentials = {
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
    connectionString: string;
};

export type CreateDedicatedDatabaseParams = {
    databaseId: string;
    name: string;
    engine?: 'postgres' | 'mysql' | 'mariadb';
    version?: string;
    region?: string;
    type?: 'shared' | 'dedicated';
    tier?: string;
    backend: 'prisma' | 'appwrite';
    cpu?: number;
    memory?: number;
    storage?: number;
    storageClass?: string;
    highAvailability?: boolean;
    haReplicaCount?: number;
    haSyncMode?: string;
    networkMaxConnections?: number;
    networkIdleTimeoutSeconds?: number;
    networkIPAllowlist?: string[];
    idleTimeoutMinutes?: number;
    backupEnabled?: boolean;
    backupPitr?: boolean;
    backupSchedule?: string;
    backupRetentionDays?: number;
    metricsEnabled?: boolean;
};

export class DedicatedDatabases {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(params: CreateDedicatedDatabaseParams): Promise<DedicatedDatabase> {
        const path = `/compute/databases`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'POST',
            uri,
            {
                'content-type': 'application/json'
            },
            {
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
                metricsEnabled: params.metricsEnabled
            }
        );
    }

    async get(databaseId: string): Promise<DedicatedDatabase> {
        const path = `/compute/databases/${databaseId}`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('GET', uri, {
            'content-type': 'application/json'
        });
    }

    async list(queries: string[] = [], search?: string): Promise<DedicatedDatabaseList> {
        const path = `/compute/databases`;
        const params: Record<string, unknown> = {};
        if (queries.length > 0) params.queries = queries;
        if (search) params.search = search;

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'GET',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async delete(params: { databaseId: string }): Promise<void> {
        const path = `/compute/databases/${params.databaseId}`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('DELETE', uri, {
            'content-type': 'application/json'
        });
    }

    async getCredentials(databaseId: string): Promise<DedicatedDatabaseCredentials> {
        const path = `/compute/databases/${databaseId}/credentials`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('GET', uri, {
            'content-type': 'application/json'
        });
    }

    async coldStart(databaseId: string): Promise<DedicatedDatabase> {
        const path = `/compute/databases/${databaseId}/cold-start`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('POST', uri, {
            'content-type': 'application/json'
        });
    }
}
