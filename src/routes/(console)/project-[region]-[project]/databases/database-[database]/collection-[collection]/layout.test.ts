import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DatabaseType } from '$database/(entity)/helpers/terminology';
import { get } from 'svelte/store';
import { load } from './+layout';
import { load as loadRecord } from '../[...rest]/+page';
import { databaseRowSheetOptions } from '../table-[table]/store';
import { noSqlDocument } from './store';

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

function recordEvent(type: DatabaseType, rest: string) {
    return {
        ...event(type),
        params: { ...params, rest },
        url: new URL(`https://console.example${databasePath}/${rest}?limit=50`)
    } as unknown as Parameters<typeof loadRecord>[0];
}

describe('collection layout', () => {
    beforeEach(() => {
        getEntity.mockReset();
        databaseRowSheetOptions.update((options) => ({ ...options, show: false, rowId: null }));
        noSqlDocument.reset();
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

    it.each(['legacy', 'tablesdb'] as const)(
        'opens the requested row after following a %s document link',
        async (type) => {
            await expect(
                loadRecord(recordEvent(type, 'collection-items/document-record'))
            ).rejects.toMatchObject({
                status: 308,
                location: `${databasePath}/collection-items?limit=50`
            });
            await expect(load(event(type, '?limit=50'))).rejects.toMatchObject({
                status: 308,
                location: `${databasePath}/table-items?limit=50`
            });

            expect(get(databaseRowSheetOptions)).toMatchObject({
                rowId: 'record',
                show: true,
                title: 'Update row'
            });
            expect(get(noSqlDocument).documentId).toBeNull();
        }
    );

    it.each(['documentsdb', 'vectorsdb'] as const)(
        'keeps a %s document link on the collection sheet',
        async (type) => {
            await expect(
                loadRecord(recordEvent(type, 'collection-items/document-record'))
            ).rejects.toMatchObject({
                status: 308,
                location: `${databasePath}/collection-items?limit=50`
            });

            expect(get(noSqlDocument).documentId).toBe('record');
            expect(get(databaseRowSheetOptions).show).toBe(false);
        }
    );

    it('keeps table row links working', async () => {
        await expect(
            loadRecord(recordEvent('tablesdb', 'table-items/row-record'))
        ).rejects.toMatchObject({
            status: 308,
            location: `${databasePath}/table-items?limit=50`
        });

        expect(get(databaseRowSheetOptions)).toMatchObject({ rowId: 'record', show: true });
        expect(get(noSqlDocument).documentId).toBeNull();
    });
});
