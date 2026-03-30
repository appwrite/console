# Dedicated Database — Console Feature Gaps

Tracking file for all missing dedicated DB features in console vs cloud/edge/ddbs backends.
**Status: ALL ITEMS COMPLETE**

## Legend

- [x] Done

---

## 1. Enums & Types — ALL DONE

- [x] `StorageClass` (ssd, nvme, hdd)
- [x] `BackupType` (full, incremental, wal)
- [x] `BackupStatusValue` (pending, running, completed, failed, verified)
- [x] `BackupStorageProvider` (s3, gcs, azure)
- [x] `RestorationType` (backup, pitr)
- [x] `RestorationStatusValue` (pending, running, completed, failed)
- [x] `HASyncMode` (async, sync, quorum)
- [x] `ReplicaRole` (primary, standby, readReplica)
- [x] `MaintenanceDay` (sun–sat)
- [x] `DataResidency` (eu, us, apac, global)
- [x] `KeyManagement` (appwriteKms, customerManaged)
- [x] `UpgradePolicy` (autoMinor, manual, scheduled)
- [x] `Capability` (24 capability flags)
- [x] `DatabaseEngine` includes mongodb
- [x] `DatabaseBackend` includes edge
- [x] `PoolerMode` (transaction, session)
- [x] `ConnectionRole` (readonly, readwrite)

## 2. Properties on `DedicatedDatabase` Type — ALL DONE

- [x] `projectId`, `externalIP`, `internalIP`, `lastActivityAt`, `idleUntil`, `networkPublicTcp`
- [x] `storageAutoscaling`, `storageAutoscalingMaxGb`, `storageAutoscalingThresholdPercent`
- [x] `securityEncryptionAtRest`, `securityKeyManagement`, `securityKeyRotationDays`, `securityCMKKeyId`
- [x] `securityAuditLogEnabled`, `securityLogRetentionDays`, `securityDataResidency`
- [x] `maintenanceWindowDay`, `maintenanceWindowHourUtc`, `maintenanceWindowDurationMinutes`, `maintenanceUpgradePolicy`
- [x] `metricsSlowQueryLogThresholdMs`, `metricsTraceSampleRate`, `lastMetricsPollAt`
- [x] `sqlApiEnabled`, `sqlApiAllowedStatements`, `sqlApiMaxBytes`, `sqlApiMaxRows`, `sqlApiTimeoutSeconds`

## 3. SDK Methods — ALL 45 DONE

- [x] Credential rotation, connections CRUD, active connections
- [x] Extensions CRUD (PostgreSQL)
- [x] Connection pooler (get, update, enable, disable)
- [x] HA status, manual failover
- [x] Cross-region (enable, disable, status, failover)
- [x] Read replicas (create, list, delete, status)
- [x] Backups (create, list, get, delete)
- [x] Restorations (create from backup, create PITR, list, get)
- [x] PITR windows
- [x] Metrics, slow queries, performance insights, audit logs
- [x] Storage resize, maintenance window, version upgrade
- [x] Backup storage (configure, get, delete)
- [x] Database status, migrate, set limits

## 4. Response Types — ALL 25 DONE

- [x] Backup, BackupList, Restoration, RestorationList
- [x] HAStatus, HAStatusReplica, ReadReplica, ReadReplicaList
- [x] CrossRegionStatus, PoolerConfig, BackupStorageConfig
- [x] ActiveConnection, ActiveConnectionList, DatabaseMetrics
- [x] PerformanceInsights (+Query, +WaitEvent), PITRWindows
- [x] AuditLog, AuditLogList, SlowQuery, SlowQueryList
- [x] DatabaseExtensions, DatabaseConnection, DatabaseConnectionList
- [x] DatabaseStatusDetail (+Connections, +Replica, +Volume)

## 5. UI — Overview Page — ALL DONE

- [x] Storage Autoscaling, Security, Maintenance Window, SQL API, Monitoring sections
- [x] `storageClass` in Resources, `externalIP`/`internalIP` in Connection

## 6. UI — Settings Page — ALL 19 COMPONENTS DONE

- [x] updateName, updateTier, updateStorage, updateNetwork
- [x] updateMaintenance, updateBackups, updateAutoscaling, updatePooler
- [x] rotateCredentials, upgradeVersion, dangerZone
- [x] updateExtensions (PostgreSQL), updateConnections (database users)
- [x] updateReadReplicas, updateCrossRegion, updateHAStatus
- [x] updateBackupStorage, updateSecurity, updateSqlApi

## 7. UI — Backup Management — ALL DONE

- [x] dedicatedBackups.svelte (list, create, delete, restore, PITR)
- [x] Integrated into backups/+page.svelte with type-conditional rendering

## 8. UI — Monitoring Page — ALL DONE

- [x] monitoring/+page.svelte + +page.ts
- [x] Metrics dashboard, active connections, slow queries, performance insights, audit logs

## 9. Navigation & Routing — ALL DONE

- [x] Monitoring tab in database header
- [x] Monitoring route loader

---

## Files Changed Summary

### New Files (28)

- `settings/updateName.svelte`
- `settings/updateTier.svelte`
- `settings/updateStorage.svelte`
- `settings/updateNetwork.svelte`
- `settings/updateMaintenance.svelte`
- `settings/updateBackups.svelte`
- `settings/updateAutoscaling.svelte`
- `settings/updatePooler.svelte`
- `settings/rotateCredentials.svelte`
- `settings/upgradeVersion.svelte`
- `settings/dangerZone.svelte`
- `settings/updateExtensions.svelte`
- `settings/updateConnections.svelte`
- `settings/updateReadReplicas.svelte`
- `settings/updateCrossRegion.svelte`
- `settings/updateHAStatus.svelte`
- `settings/updateBackupStorage.svelte`
- `settings/updateSecurity.svelte`
- `settings/updateSqlApi.svelte`
- `backups/dedicatedBackups.svelte`
- `monitoring/+page.svelte`
- `monitoring/+page.ts`

### Modified Files (5)

- `src/lib/sdk/dedicatedDatabases.ts` — Complete rewrite with all types, enums, and 45 SDK methods
- `dedicatedOverview.svelte` — Added 5 new CardGrid sections + IP/storageClass fields
- `settings/+page.svelte` — Rewritten with dedicated type branch + 19 sub-component imports
- `header.svelte` — Added Monitoring tab
- `backups/+page.svelte` — Added dedicated backups conditional
- `src/lib/actions/analytics.ts` — Added Submit enum entries for new operations
