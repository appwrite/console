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

import type { IndexType, Models, OrderBy } from '@appwrite.io/console';

export type DatabaseSdkResult = {
    create: (
        type: DatabaseType,
        params: {
            databaseId: string;
            name: string;
            enabled?: boolean;
        }
    ) => Promise<Models.Database>;
    list: (params: { queries?: string[]; search?: string }) => Promise<Models.DatabaseList>;
    createEntity: (params: {
        databaseId: string;
        entityId: string;
        name: string;
        databaseType?: DatabaseType;
        dimension?: number /* vectorDB specific */;
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
    createIndex: (params: {
        databaseId: string;
        entityId: string;
        key: string;
        type: IndexType;
        attributes: string[];
        lengths?: number[];
        orders?: OrderBy[];
        databaseType?: DatabaseType;
    }) => Promise<Index>;
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
        type = databaseType!;
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
                case 'vectordb': {
                    return await baseSdk.vectorDB.create(params);
                }
                default:
                    throw new Error('Unknown database type');
            }
        },

        async list(params): Promise<Models.DatabaseList> {
            const results = await Promise.all([
                baseSdk.tablesDB.list(params),
                baseSdk.documentsDB.list(params),
                baseSdk.vectorDB.list(params)
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
                case 'documentsdb': {
                    const table = await baseSdk.documentsDB.createCollection({
                        ...params,
                        collectionId: params.entityId
                    });

                    return toSupportiveEntity(table);
                }
                case 'vectordb': {
                    const collection = await baseSdk.vectorDB.createCollection({
                        ...params,
                        dimension: params.dimension,
                        collectionId: params.entityId
                    });

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
                case 'documentsdb': {
                    const { total, collections } =
                        await baseSdk.documentsDB.listCollections(params);
                    return { total, entities: collections.map(toSupportiveEntity) };
                }
                case 'vectordb': {
                    const { total, collections } = await baseSdk.vectorDB.listCollections(params);
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
                case 'documentsdb': {
                    const collection = await baseSdk.documentsDB.getCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });

                    return toSupportiveEntity(collection);
                }
                case 'vectordb': {
                    const collection = await baseSdk.vectorDB.getCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });

                    return toSupportiveEntity(collection);
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        },

        async delete(params) {
            switch (type ?? params.databaseType) {
                case 'legacy': /* databases api */
                case 'tablesdb':
                    return await baseSdk.tablesDB.delete(params);
                case 'documentsdb':
                    return await baseSdk.documentsDB.delete(params);
                case 'vectordb':
                    return await baseSdk.vectorDB.delete(params);
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
                case 'documentsdb':
                    return await baseSdk.documentsDB.deleteCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });
                case 'vectordb':
                    return await baseSdk.vectorDB.deleteCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });
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
                case 'documentsdb':
                    return await baseSdk.documentsDB.createDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'vectordb': {
                    return await baseSdk.vectorDB.createDocument({
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
                case 'documentsdb':
                    return await baseSdk.documentsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });
                case 'vectordb': {
                    const { documents } = await baseSdk.vectorDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        data: params.data,
                        permissions: params.permissions
                    });

                    return toSupportiveRecord(documents[0]);
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
                case 'documentsdb':
                    return await baseSdk.documentsDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        permissions: params.permissions
                    });
                case 'vectordb': {
                    const { documents } = await baseSdk.vectorDB.upsertDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId,
                        permissions: params.permissions
                    });

                    return toSupportiveRecord(documents[0]);
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
                case 'documentsdb': {
                    const document = await baseSdk.documentsDB.deleteDocument({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        documentId: params.recordId
                    });
                    return toSupportiveRecord(document);
                }
                case 'vectordb': {
                    if (!params.recordId) {
                        throw new Error('Record ID is required to delete a VectorDB document');
                    }

                    const document = await baseSdk.vectorDB.deleteDocument({
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
                case 'documentsdb': {
                    const { total, documents } = await baseSdk.documentsDB.deleteDocuments({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        queries: params.queries
                    });
                    return { total, records: documents.map(toSupportiveRecord) };
                }
                case 'vectordb': {
                    const { total, documents } = await baseSdk.vectorDB.deleteDocuments({
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
                        type: params.type,
                        columns: params.attributes,
                        lengths: params.lengths,
                        orders: params.orders
                    });
                    return toSupportiveIndex(index);
                }
                case 'documentsdb': {
                    const index = await baseSdk.documentsDB.createIndex({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        key: params.key,
                        type: params.type,
                        attributes: params.attributes,
                        lengths: params.lengths,
                        orders: params.orders
                    });
                    return toSupportiveIndex(index);
                }
                case 'vectordb': {
                    const index = await baseSdk.vectorDB.createIndex({
                        databaseId: params.databaseId,
                        collectionId: params.entityId,
                        key: params.key,
                        type: params.type,
                        attributes: params.attributes,
                        lengths: params.lengths,
                        orders: params.orders
                    });

                    return toSupportiveIndex(index);
                }
                default:
                    throw new Error(`Unknown database type`);
            }
        }
    };
}
