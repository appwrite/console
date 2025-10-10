import { sdk } from '$lib/stores/sdk';
import type { Page } from '@sveltejs/kit';
import type { TerminologyResult } from './types';
import { type DatabaseType, type EntityList, toSupportiveEntity } from './terminology';

export type DatabaseSdkResult = {
    listEntities: (params: {
        databaseId: string;
        queries?: string[];
        search?: string;
    }) => Promise<EntityList>;
    deleteEntity: (params: { databaseId: string }) => Promise<{}>;
};

export function useDatabasesSdk(
    regionOrPage: string | Page,
    projectOrTerminology: string | TerminologyResult,
    databaseType?: DatabaseType
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
        async listEntities(params) {
            switch (type) {
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

        async deleteEntity(params) {
            switch (type) {
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
