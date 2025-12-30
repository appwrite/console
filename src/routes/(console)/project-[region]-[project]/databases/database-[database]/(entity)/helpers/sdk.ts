import { sdk } from '$lib/stores/sdk';
import type { Page } from '@sveltejs/kit';
import type { TerminologyResult } from './types';
import { type DatabaseType, type Entity, type EntityList, toSupportiveEntity } from './terminology';
import type { Models } from '@appwrite.io/console';

export type DatabaseSdkResult = {
    list: (params: { queries?: string[]; search?: string }) => Promise<Models.DatabaseList>;
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
};

export function useDatabasesSdk(
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
                case 'vectordb':
                    throw new Error(`Database type not supported yet`);
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
                    const table = await baseSdk.documentsDB.getCollection({
                        databaseId: params.databaseId,
                        collectionId: params.entityId
                    });
                    return toSupportiveEntity(table);
                }
                case 'vectordb':
                    throw new Error(`Database type not supported yet`);
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
                    throw new Error(`Database type not supported yet`);
                default:
                    throw new Error(`Unknown database type`);
            }
        }
    };
}
