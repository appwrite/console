import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DatabaseType } from '$database/(entity)/helpers/terminology';
import { load } from './+layout';

const { getEntity } = vi.hoisted(() => ({ getEntity: vi.fn() }));

vi.mock('./header.svelte', () => ({ default: {} }));
vi.mock('$database/(entity)', async () => {
    const { toDatabaseType } = await import('$database/(entity)/helpers/terminology');
    return {
        Breadcrumbs: {},
        toDatabaseType,
        useDatabaseSdk: () => ({ getEntity })
    };
});

const params = { region: 'fra', project: 'project', database: 'database', collection: 'items' };
const databasePath = '/console/project-fra-project/databases/database-database';

function event(type: DatabaseType, suffix = '') {
    return {
        params,
        depends: vi.fn(),
        parent: async () => ({ database: { $id: params.database, type } }),
        url: new URL(`https://console.example${databasePath}/collection-items${suffix}`)
    } as unknown as Parameters<typeof load>[0];
}

describe('collection layout', () => {
    beforeEach(() => {
        getEntity.mockReset();
    });

    it.each([
        ['legacy', ''],
        ['legacy', '/indexes?search=name'],
        ['legacy', '/settings'],
        ['legacy', '/export'],
        ['tablesdb', '?limit=50&query=%5B%5D']
    ] as const)('redirects %s collection links to the table page (%s)', async (type, suffix) => {
        await expect(load(event(type, suffix))).rejects.toMatchObject({
            status: 308,
            location: `${databasePath}/table-items${suffix}`
        });
        expect(getEntity).not.toHaveBeenCalled();
    });

    it.each(['documentsdb', 'vectorsdb'] as const)('loads a %s collection', async (type) => {
        const collection = { $id: params.collection, name: 'Items' };
        getEntity.mockResolvedValue(collection);

        const result = await load(event(type));

        expect(result).toMatchObject({ collection });
        expect(getEntity).toHaveBeenCalledWith({
            databaseId: params.database,
            entityId: params.collection
        });
    });
});
