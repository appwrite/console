/**
 * Type augmentations for dedicated database types not yet published in
 * the @appwrite.io/console SDK. Remove this file once the SDK includes
 * these types natively.
 */
import '@appwrite.io/console';

declare module '@appwrite.io/console' {
    export namespace Models {
        interface DedicatedDatabase {
            $id: string;
            $createdAt: string;
            $updatedAt: string;
            name: string;
            type: string;
            status: string;
            containerStatus?: string;
            error?: string;
            engine: string;
            version: string;
            region: string;
            backend: string;
            tier: string;
            cpu: number;
            memory: number;
            storage: number;
            maxStorageGb?: number;
            storageClass?: string;
            hostname?: string;
            connectionPort: number;
            connectionUser?: string;
            connectionPassword?: string;
            connectionString?: string;
            externalIP?: string;
            internalIP?: string;
            networkMaxConnections: number;
            networkIdleTimeoutSeconds: number;
            networkIPAllowlist?: string[];
            idleTimeoutMinutes?: number;
            highAvailability: boolean;
            haReplicaCount: number;
            haSyncMode?: string;
            backupEnabled: boolean;
            backupPitr: boolean;
            backupCron?: string;
            backupRetentionDays: number;
            pitrRetentionDays?: number;
            storageAutoscaling: boolean;
            storageAutoscalingThresholdPercent: number;
            storageAutoscalingMaxGb: number;
            maintenanceWindowDay: string;
            maintenanceWindowHourUtc: number;
            maintenanceWindowDurationMinutes: number;
            maintenanceUpgradePolicy?: string;
            sqlApiEnabled: boolean;
            sqlApiMaxBytes: number;
            sqlApiMaxRows: number;
            sqlApiTimeoutSeconds: number;
            sqlApiAllowedStatements?: string[];
            metricsEnabled?: boolean;
            metricsSlowQueryLogThresholdMs?: number;
            metricsTraceSampleRate?: number;
            lastMetricsPollAt?: number;
            securityAuditLogEnabled?: boolean;
            securityLogRetentionDays?: number;
            securityEncryptionAtRest?: boolean;
            securityKeyManagement?: string;
            securityDataResidency?: string;
        }

        interface DedicatedDatabaseList {
            total: number;
            databases: DedicatedDatabase[];
        }

        interface DedicatedDatabaseConnection {
            $id: string;
            $createdAt: string;
            username: string;
            database: string;
            role: string;
        }

        interface DedicatedDatabaseBackup {
            $id: string;
            $createdAt: string;
            type: string;
            status: string;
            sizeBytes?: number;
            startedAt: number;
            completedAt?: number;
            expiresAt?: number;
            error?: string;
        }

        interface DedicatedDatabaseBackupList {
            total: number;
            backups: DedicatedDatabaseBackup[];
        }

        interface DedicatedDatabaseRestoration {
            $id: string;
            type: string;
            status: string;
            backupId?: string;
            targetTime?: number;
            startedAt: number;
            completedAt?: number;
        }

        interface DedicatedDatabaseRestorationList {
            total: number;
            restorations: DedicatedDatabaseRestoration[];
        }

        interface DedicatedDatabasePITRWindows {
            earliest: string;
            latest: string;
        }

        interface DedicatedDatabaseBranch {
            $id: string;
            branchId: string;
            branchName?: string;
            namespace: string;
            expiresAt: number;
        }

        interface DedicatedDatabaseBranchList {
            total: number;
            branches: DedicatedDatabaseBranch[];
        }

        interface DedicatedDatabaseMetrics {
            [key: string]: unknown;
        }

        interface DedicatedDatabaseSlowQueryList {
            total: number;
            slowQueries: Array<{
                query: string;
                duration: number;
                calls: number;
                user?: string;
                database?: string;
            }>;
        }

        interface DedicatedDatabasePerformanceInsights {
            totalCalls: number;
            totalTimeMs: number;
            avgTimeMs: number;
            topQueries: Array<{
                query: string;
                avgTime: number;
                calls: number;
                totalTime: number;
                meanTime: number;
                rows: number;
            }>;
            waitEvents: Array<{
                event: string;
                type: string;
                count: number;
                avgWaitMs: number;
                totalWaitMs: number;
            }>;
            [key: string]: unknown;
        }

        interface DedicatedDatabaseAuditLogList {
            total: number;
            auditLogs: Array<{
                timestamp: number;
                user: string;
                action: string;
                object: string;
                statement?: string;
                client?: string;
            }>;
        }

        interface DedicatedDatabaseReadReplica {
            $id: string;
            sourceRegion: string;
            targetRegion: string;
            status: string;
            hostname?: string;
            lagSeconds: number;
        }

        interface DedicatedDatabasePooler {
            enabled: boolean;
            mode: string;
            defaultPoolSize: number;
        }

        interface DedicatedDatabaseExtensions {
            installed: string[];
            available: string[];
        }

        interface DedicatedDatabaseHAReplica {
            $id: string;
            role: string;
            status: string;
            lagSeconds: number;
        }

        interface DedicatedDatabaseHAStatus {
            enabled: boolean;
            status?: string;
            replicas: DedicatedDatabaseHAReplica[];
        }

        interface DedicatedDatabaseBackupStorage {
            provider: string;
            bucket: string;
            region?: string;
            prefix?: string;
            endpoint?: string;
            accessKey?: string;
            secretKey?: string;
        }

        interface DatabaseStatus {
            version: string;
            [key: string]: unknown;
        }
    }
}
