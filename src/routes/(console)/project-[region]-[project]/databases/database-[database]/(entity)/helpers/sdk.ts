import { sdk } from '$lib/stores/sdk';
import type { Page } from '@sveltejs/kit';
import type { TerminologyResult } from './types';
import {
    type DatabaseType,
    type Entity,
    type EntityList,
    type Index,
    type Record,
    type RecordList,
    toSupportiveEntity,
    toSupportiveRecord,
    toSupportiveIndex
} from './terminology';

import {
    Backend,
    Engine,
    Region,
    type DatabasesIndexType,
    type Models,
    type OrderBy,
    type TablesDBIndexType
} from '@appwrite.io/console';

export type DedicatedDatabaseParams = {
    databaseId: string;
    name: string;
    enabled?: boolean;
    engine?: Engine;
    region?: string;
    tier?: string;
    highAvailability?: boolean;
    backupEnabled?: boolean;
    backupSchedule?: string;
    backupRetentionDays?: number;
    backupPitr?: boolean;
    pitrRetentionDays?: number;
};

export type DatabaseSdkResult = {
    create: (
        type: DatabaseType,
        params:
            | {
                  databaseId: string;
                  name: string;
                  enabled?: boolean;
              }
            | DedicatedDatabaseParams
    ) => Promise<Models.Database>;
    list: (params: { queries?: string[]; search?: string }) => Promise<Models.DatabaseList>;
    createEntity: (params: {
        databaseId: string;
        entityId: string;
        name: string;
        databaseType?: DatabaseType;
        dimension?: number /* vectorsDB specific */;
    }) => Promise<Entity>;
    getEntity: (params: {
        databaseId: string;
        entityId: string;
        databaseType?: DatabaseType;
    }) => Promise<Entity>;
    listEntities: (params: {
        databaseId: string;
        queries?: string[];
        search?: string;
        databaseType?: DatabaseType;
    }) => Promise<EntityList>;
    delete: (params: { databaseId: string; databaseType?: DatabaseType }) => Promise<{}>;
    deleteEntity: (params: {
        databaseId: string;
        entityId: string;
        databaseType?: DatabaseType;
    }) => Promise<{}>;
    updateEntity: (params: {
        databaseId: string;
        entityId: string;
        name?: string;
        permissions?: string[];
        documentSecurity?: boolean;
        enabled?: boolean;
        databaseType?: DatabaseType;
    }) => Promise<Entity>;
    createRecord: (params: {
        databaseId: string;
        entityId: string;
        recordId: string;
        data?: object;
        permissions?: string[];
        databaseType?: DatabaseType;
    }) => Promise<Record>;
    updateRecord: (params: {
        databaseId: string;
        entityId: string;
        recordId: string;
        data?: object;
        permissions?: string[];
        databaseType?: DatabaseType;
    }) => Promise<Record>;
    updateRecordPermissions: (params: {
        databaseId: string;
        entityId: string;
        recordId: string;
        permissions: string[];
        databaseType?: DatabaseType;
    }) => Promise<Record>;
    deleteRecord: (params: {
        databaseId: string;
        entityId: string;
        recordId: string;
        databaseType?: DatabaseType;
    }) => Promise<Record>;
    deleteRecords: (params: {
        databaseId: string;
        entityId: string;
        queries?: string[];
        databaseType?: DatabaseType;
    }) => Promise<RecordList>;
    createIndex: (params: {
        databaseId: string;
        entityId: string;
        key: string;
        type: string;
        attributes: string[];
        lengths?: number[];
        orders?: OrderBy[];
        databaseType?: DatabaseType;
    }) => Promise<Index>;
    deleteIndex: (params: {
        databaseId: string;
        entityId: string;
        key: string;
        databaseType?: DatabaseType;
    }) => Promise<{}>;
};

/**
 * Returns the raw DocumentsDB or VectorsDB SDK service for a given database type.
 * Use in load functions (.ts) where Svelte runes aren't available.
 */
export function getCollectionService(region: string, project: string, type: DatabaseType) {
    const projectSdk = sdk.forProject(region, project);
    switch (type) {
        case 'documentsdb':
            return projectSdk.documentsDB;
        case 'vectorsdb':
            return projectSdk.vectorsDB;
        default:
            throw new Error(`Unsupported collection database type: ${type}`);
    }
}

export function useDatabaseSdkFromPage(
    page: Page,
    terminology: TerminologyResult
): DatabaseSdkResult {
    const region = page?.params?.region || '';
    const project = page?.params?.project || '';
    return buildDatabaseSdk(region, project, terminology.type);
}

export function useDatabaseSdkFromParams(
    region: string,
    project: string,
    databaseType: DatabaseType
): DatabaseSdkResult {
    return buildDatabaseSdk(region, project, databaseType);
}

export function useDatabaseSdk(
    regionOrPage: string | Page,
    projectOrTerminology: string | TerminologyResult,
    databaseType?: DatabaseType
): DatabaseSdkResult {
    if (typeof regionOrPage === 'object' && typeof projectOrTerminology === 'object') {
        return useDatabaseSdkFromPage(regionOrPage, projectOrTerminology);
    }
    return useDatabaseSdkFromParams(
        regionOrPage as string,
        projectOrTerminology as string,
        databaseType
    );
}

type DedicatedDatabaseMapped = Models.Database & {
    engine: string;
    status: string;
    tier: string;
    region: string;
};

function buildDatabaseSdk(region: string, project: string, type: DatabaseType): DatabaseSdkResult {
    const baseSdk = sdk.forProject(region, project);

    return {
        async create(type, params): Promise<Models.Database> {
            switch (type) {
                case 'legacy': /* databases api */
                case 'tablesdb': {
                    return await baseSdk.tablesDB.create(params);
                }
                case 'documentsdb': {
                    return await baseSdk.documentsDB.create(params);
                }
                case 'vectorsdb': {
                    return await baseSdk.vectorsDB.create(params);
                }
                case 'dedicateddb': {
                    const dedicatedParams = params as DedicatedDatabaseParams;
                    return (await baseSdk.compute.createDatabase({
                        databaseId: dedicatedParams.databaseId,
                        name: dedicatedParams.name,
                        backend: Backend.Edge,
                        engine: dedicatedParams.engine ?? Engine.Postgres,
                        region: dedicatedParams.region as Region,
                        tier: dedicatedParams.tier,
                        highAvailability: dedicatedParams.highAvailability,
                        backupEnabled: dedicatedParams.backupEnabled,
                        backupCron: dedicatedParams.backupSchedule,
                        backupRetentionDays: dedicatedParams.backupRetentionDays,
                        backupPitr: dedicatedParams.backupPitr,
                        pitrRetentionDays: dedicatedParams.pitrRetentionDays
                    })) as unknown as Models.Database;
                }
                default:
                    throw new Error('Unknown database type');
            }
        },

        // Pagination is per-backend, not aggregate across all backends.
        async list(params): Promise<Models.DatabaseList> {
            const emptyDatabaseList: Models.DatabaseList = { total: 0, databases: [] };
            const emptyDedicatedList: Models.DedicatedDatabaseList = {
                total: 0,
                databases: []
            };

            const [tablesSettled, documentsSettled, vectorsSettled, dedicatedSettled] =
                await Promise.allSettled([
                    baseSdk.tablesDB.list(params),
                    baseSdk.documentsDB.list(params),
                    baseSdk.vectorsDB.list(params),
                    baseSdk.compute.listDatabases({
                        queries: params.queries,
                        search: params.search
                    })
                ]);

            const tablesResult =
                tablesSettled.status === 'fulfilled' ? tablesSettled.value : emptyDatabaseList;
            const documentsResult =
                documentsSettled.status === 'fulfilled'
                    ? documentsSettled.value
                    : emptyDatabaseList;
            const vectorsResult =
                vectorsSettled.status === 'fulfilled' ? vectorsSettled.value : emptyDatabaseList;
            const dedicatedResult =
                dedicatedSettled.status === 'fulfilled'
                    ? dedicatedSettled.value
                    : emptyDedicatedList;

            const dedicatedAsDatabases: DedicatedDatabaseMapped[] = (
                dedicatedResult.databases ?? []
            ).map((database) => ({
                $id: database.$id,
                $createdAt: database.$createdAt,
                $updatedAt: database.$updatedAt,
                name: database.name,
                enabled: database.status === 'ready' || database.status === 'active',
                type: database.type as Models.Database['type'],
                policies: [],
                archives: [],
                engine: database.engine,
                status: database.status,
                tier: database.tier,
                region: database.region
            }));

            return {
                total:
                    tablesResult.total +
                    documentsResult.total +
                    vectorsResult.total +
                    (dedicatedResult.total ?? 0),
                databases: [
                    ...tablesResult.databases,
                    ...documentsResult.databases,
                    ...vectorsResult.databases,
                    ...dedicatedAsDatabases
                ]
            };
        },

        async createEntity(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb': {
                    const table = await baseSdk.tablesDB.createTable({
                        ...params,
                        tableId: params.entityId
                    });
                    return toSupportiveEntity(table);
                }
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support entity creation via Appwrite');
                case 'documentsdb': {
                    const table = await baseSdk.documentsDB.createCollection({
                        ...params,
                        collectionId: params.entityId
                    });

                    return toSupportiveEntity(table);
                }
                case 'vectorsdb': {
                    const collectionParams = {
                        ...params,
                        dimension: params.dimension,
                        collectionId: params.entityId
                    };
                    const collection = await baseSdk.vectorsDB.createCollection(collectionParams);

                    return toSupportiveEntity(collection);
                }
                default:
                    throw new Error('Unknown database type');
            }
        },

        async listEntities(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb': {
                    const { total, tables } = await baseSdk.tablesDB.listTables(params);
                    return { total, entities: tables.map(toSupportiveEntity) };
                }
                case 'dedicateddb': {
                    return { total: 0, entities: [] };
                }
                case 'documentsdb': {
                    const { total, collections } =
                        await baseSdk.documentsDB.listCollections(params);
                    return { total, entities: collections.map(toSupportiveEntity) };
                }
                case 'vectorsdb': {
                    const { total, collections } = await baseSdk.vectorsDB.listCollections(params);
                    return { total, entities: collections.map(toSupportiveEntity) };
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async getEntity(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb': {
                    const table = await baseSdk.tablesDB.getTable({
                        databaseId: params.databaseId,
                        tableId: params.entityId
                    });
                    return toSupportiveEntity(table);
                }
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support entity retrieval via Appwrite');
                case 'documentsdb': {
                    const collection = await baseSdk.documentsDB.getCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });

                    return toSupportiveEntity(collection);
                }
                case 'vectorsdb': {
                    const collection = await baseSdk.vectorsDB.getCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });

                    return toSupportiveEntity(collection);
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async delete(params): Promise<{}> {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return await baseSdk.tablesDB.delete(params);
                case 'documentsdb':
                    return await baseSdk.documentsDB.delete(params);
                case 'dedicateddb':
                    await baseSdk.compute.deleteDatabase(params);
                    return {};
                case 'vectorsdb':
                    return await baseSdk.vectorsDB.delete(params);
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async deleteEntity(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return await baseSdk.tablesDB.deleteTable({
                        databaseId: params.databaseId,
                        tableId: params.entityId
                    });
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support entity deletion via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.deleteCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });
                case 'vectorsdb':
                    return await baseSdk.vectorsDB.deleteCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async updateEntity(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return toSupportiveEntity(
                        await baseSdk.tablesDB.updateTable({
                            databaseId: params.databaseId,
                            tableId: params.entityId,
                            name: params.name,
                            permissions: params.permissions,
                            rowSecurity: params.documentSecurity,
                            enabled: params.enabled
                        })
                    );
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support entity updates via Appwrite');
                case 'documentsdb':
                    return toSupportiveEntity(
                        await baseSdk.documentsDB.updateCollection({
                            databaseId: params.databaseId,
                            collectionId: params.entityId,
                            name: params.name,
                            permissions: params.permissions,
                            documentSecurity: params.documentSecurity,
                            enabled: params.enabled
                        })
                    );
                case 'vectorsdb':
                    return toSupportiveEntity(
                        await baseSdk.vectorsDB.updateCollection({
                            databaseId: params.databaseId,
                            collectionId: params.entityId,
                            name: params.name,
                            permissions: params.permissions,
                            documentSecurity: params.documentSecurity,
                            enabled: params.enabled
                        })
                    );
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async createRecord(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return await baseSdk.tablesDB.createRow({
                        databaseId: params.databaseId,
                        tableId: params.entityId,
                        rowId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support record creation via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.createDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'vectorsdb': {
                    return await baseSdk.vectorsDB.createDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async updateRecord(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return await baseSdk.tablesDB.updateRow({
                        databaseId: params.databaseId,
                        tableId: params.entityId,
                        rowId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support record updates via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'vectorsdb': {
                    return await baseSdk.vectorsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async updateRecordPermissions(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return await baseSdk.tablesDB.updateRow({
                        databaseId: params.databaseId,
                        tableId: params.entityId,
                        rowId: params.recordId,
                        permissions: params.permissions
                    });
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support permission updates via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        permissions: params.permissions
                    });
                case 'vectorsdb': {
                    return await baseSdk.vectorsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        permissions: params.permissions
                    });
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async deleteRecord(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb': {
                    const row = await baseSdk.tablesDB.deleteRow({
                        databaseId: params.databaseId,
                        tableId: params.entityId,
                        rowId: params.recordId
                    });
                    return toSupportiveRecord(row);
                }
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support record deletion via Appwrite');
                case 'documentsdb': {
                    const document = await baseSdk.documentsDB.deleteDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId
                    });
                    return toSupportiveRecord(document);
                }
                case 'vectorsdb': {
                    if (!params.recordId) {
                        throw new Error('Record ID is required to delete a VectorsDB document');
                    }

                    const document = await baseSdk.vectorsDB.deleteDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId
                    });

                    return toSupportiveRecord(document);
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async deleteRecords(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb': {
                    const { total, rows } = await baseSdk.tablesDB.deleteRows({
                        databaseId: params.databaseId,
                        tableId: params.entityId,
                        queries: params.queries
                    });
                    return { total, records: rows.map(toSupportiveRecord) };
                }
                case 'dedicateddb':
                    throw new Error(
                        'DedicatedDB does not support bulk record deletion via Appwrite'
                    );
                case 'documentsdb': {
                    const { total, documents } = await baseSdk.documentsDB.deleteDocuments({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        queries: params.queries
                    });
                    return { total, records: documents.map(toSupportiveRecord) };
                }
                case 'vectorsdb': {
                    const { total, documents } = await baseSdk.vectorsDB.deleteDocuments({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        queries: params.queries
                    });

                    return { total, records: documents.map(toSupportiveRecord) };
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async createIndex(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb': {
                    const index = await baseSdk.tablesDB.createIndex({
                        databaseId: params.databaseId,
                        tableId: params.entityId,
                        key: params.key,
                        type: params.type as TablesDBIndexType,
                        columns: params.attributes,
                        lengths: params.lengths,
                        orders: params.orders
                    });
                    return toSupportiveIndex(index);
                }
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support index creation via Appwrite');
                case 'documentsdb': {
                    const index = await baseSdk.documentsDB.createIndex({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        key: params.key,
                        type: params.type as DatabasesIndexType,
                        attributes: params.attributes,
                        lengths: params.lengths,
                        orders: params.orders
                    });
                    return toSupportiveIndex(index);
                }
                case 'vectorsdb': {
                    const index = await baseSdk.vectorsDB.createIndex({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        key: params.key,
                        type: params.type as DatabasesIndexType,
                        attributes: params.attributes,
                        lengths: params.lengths,
                        orders: params.orders
                    });

                    return toSupportiveIndex(index);
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async deleteIndex(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return await baseSdk.tablesDB.deleteIndex({
                        databaseId: params.databaseId,
                        tableId: params.entityId,
                        key: params.key
                    });
                case 'dedicateddb':
                    throw new Error('DedicatedDB does not support index deletion via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.deleteIndex({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        key: params.key
                    });
                case 'vectorsdb':
                    return await baseSdk.vectorsDB.deleteIndex({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        key: params.key
                    });
                default:
                    throw new Error(`Unknown database type`);
            }
        }
    };
}
