import { sdk } from '$lib/stores/sdk';
import type { Page } from '@sveltejs/kit';
import type { TerminologyResult } from './types';
import {
    type DatabaseType,
    type Entity,
    type EntityList,
    type Record,
    type RecordList,
    toSupportiveEntity,
    toSupportiveRecord
} from './terminology';
import type { Models } from '@appwrite.io/console';

export type DedicatedDatabaseParams = {
    databaseId: string;
    name: string;
    enabled?: boolean;
    engine?: 'postgres' | 'mysql' | 'mariadb';
    region?: string;
    tier?: string;
    highAvailability?: boolean;
    backupEnabled?: boolean;
    backupSchedule?: string;
    backupRetentionDays?: number;
    backupPitr?: boolean;
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
        recordId?: string;
        databaseType?: DatabaseType;
    }) => Promise<Record>;
    deleteRecords: (params: {
        databaseId: string;
        entityId: string;
        queries?: string[];
        databaseType?: DatabaseType;
    }) => Promise<RecordList>;
};

export function useDatabaseSdk(
    regionOrPage: string | Page,
    projectOrTerminology: string | TerminologyResult,
    databaseType?: DatabaseType /* nullable for use at top `databases` level */
): DatabaseSdkResult {
    let region: string;
    let project: string;
    let type: DatabaseType;

    if (typeof regionOrPage === 'object' && typeof projectOrTerminology === 'object') {
        type = projectOrTerminology.type;
        region = regionOrPage?.params?.region || '';
        project = regionOrPage?.params?.project || '';
    } else {
        type = databaseType;
        region = regionOrPage as string;
        project = projectOrTerminology as string;
    }

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
                case 'prisma': {
                    // Prisma databases are created via the compute/databases endpoint
                    // with backend: 'prisma'
                    const prismaParams = params as DedicatedDatabaseParams;
                    return (await baseSdk.dedicatedDatabases.create({
                        databaseId: prismaParams.databaseId,
                        name: prismaParams.name,
                        backend: 'prisma',
                        engine: 'postgres',
                        region: prismaParams.region,
                        tier: prismaParams.tier
                    })) as unknown as Models.Database;
                }
                case 'dedicated': {
                    // Dedicated databases are created via the compute/databases endpoint
                    // with backend: 'appwrite'
                    const dedicatedParams = params as DedicatedDatabaseParams;
                    return (await baseSdk.dedicatedDatabases.create({
                        databaseId: dedicatedParams.databaseId,
                        name: dedicatedParams.name,
                        backend: 'appwrite',
                        engine: dedicatedParams.engine,
                        region: dedicatedParams.region,
                        tier: dedicatedParams.tier,
                        highAvailability: dedicatedParams.highAvailability,
                        backupEnabled: dedicatedParams.backupEnabled,
                        backupSchedule: dedicatedParams.backupSchedule,
                        backupRetentionDays: dedicatedParams.backupRetentionDays,
                        backupPitr: dedicatedParams.backupPitr
                    })) as unknown as Models.Database;
                }
                case 'vectordb':
                    throw new Error('Database type not supported yet');
                default:
                    throw new Error('Unknown database type');
            }
        },

        async list(params): Promise<Models.DatabaseList> {
            const results = await Promise.all([
                baseSdk.tablesDB.list(params)

                // not available just yet!
                // baseSdk.documentsDB.list(params),
            ]);

            return results.reduce(
                (acc, curr) => ({
                    total: acc.total + curr.total,
                    databases: [...acc.databases, ...curr.databases]
                }),
                { total: 0, databases: [] as Models.Database[] }
            );
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support entity creation via Appwrite');
                case 'documentsdb': {
                    const table = await baseSdk.documentsDB.createCollection({
                        ...params,
                        collectionId: params.entityId
                    });

                    return toSupportiveEntity(table);
                }
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated': {
                    // External databases don't have entities managed by Appwrite
                    return { total: 0, entities: [] };
                }
                case 'documentsdb': {
                    const { total, collections } =
                        await baseSdk.documentsDB.listCollections(params);
                    return { total, entities: collections.map(toSupportiveEntity) };
                }
                case 'vectordb':
                    throw new Error('Database type not supported yet');
                default:
                    throw new Error('Unknown database type');
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support entity retrieval via Appwrite');
                case 'documentsdb': {
                    const table = await baseSdk.documentsDB.getCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });
                    return toSupportiveEntity(table);
                }
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated':
                    await baseSdk.dedicatedDatabases.delete(params);
                    return {};
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support entity deletion via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.deleteCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support record creation via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.createDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support record updates via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support permission updates via Appwrite');
                case 'documentsdb':
                    return await baseSdk.documentsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        permissions: params.permissions
                    });
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support record deletion via Appwrite');
                case 'documentsdb': {
                    const document = await baseSdk.documentsDB.deleteDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId
                    });
                    return toSupportiveRecord(document);
                }
                case 'vectordb':
                    throw new Error('Database type not supported yet');
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
                case 'prisma':
                case 'dedicated':
                    throw new Error('External databases do not support bulk record deletion via Appwrite');
                case 'documentsdb': {
                    const { total, documents } = await baseSdk.documentsDB.deleteDocuments({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        queries: params.queries
                    });
                    return { total, records: documents.map(toSupportiveRecord) };
                }
                case 'vectordb':
                    throw new Error('Database type not supported yet');
                default:
                    throw new Error(`Unknown database type`);
            }
        }
    };
}
