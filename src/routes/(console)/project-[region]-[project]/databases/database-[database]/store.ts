import { writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';
import { IconCloudUpload, IconCog } from '@appwrite.io/pink-icons-svelte';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import type { Page } from '@sveltejs/kit';
import { AppwriteException, type Models, Query } from '@appwrite.io/console';
import { chunks } from '$lib/helpers/array';
import type { Entity, Field } from '$database/(entity)';
import { isRelationship } from '$database/table-[table]/rows/store';
import type { TagValue } from '$lib/components/filters/store';
import type { SortDirection } from '$lib/components';
import { entityColumnSuggestions } from '$database/(suggestions)';

export type Columns =
    | Models.ColumnBoolean
    | Models.ColumnEmail
    | Models.ColumnEnum
    | Models.ColumnFloat
    | Models.ColumnBigint
    | Models.ColumnInteger
    | Models.ColumnIp
    | Models.ColumnString
    | Models.ColumnText
    | Models.ColumnMediumtext
    | Models.ColumnLongtext
    | Models.ColumnVarchar
    | Models.ColumnUrl
    | Models.ColumnPoint
    | Models.ColumnLine
    | Models.ColumnPolygon
    | (Models.ColumnRelationship & { default?: never });

export type Attributes =
    | Models.AttributeBoolean
    | Models.AttributeEmail
    | Models.AttributeEnum
    | Models.AttributeFloat
    | Models.AttributeInteger
    | Models.AttributeIp
    | Models.AttributeString
    | Models.AttributeText
    | Models.AttributeMediumtext
    | Models.AttributeLongtext
    | Models.AttributeVarchar
    | Models.AttributeUrl
    | Models.AttributePoint
    | Models.AttributeLine
    | Models.AttributePolygon
    | (Models.AttributeRelationship & { default?: never });

export type Collection = Omit<Models.Collection, 'attributes'> & {
    attributes: Array<Attributes>;
};

export type Table = Omit<Models.Table, 'columns'> & {
    columns: Array<Columns>;
};

export type SortState = {
    column?: string;
    direction: SortDirection;
};

export type RandomDataSchema = {
    show: boolean;
    value: number;
    columns?: boolean;
    managed: boolean;
    onSubmit?: () => Promise<void> | void;
};

/**
 * adding a lot of fake data will trigger the realtime below
 * and will keep invalidating the `Dependencies.ENTITY` making a lot of API noise!
 */
export const isWaterfallFromFaker = writable(false);

export const expandTabs = writable(null);

export const showCreateEntity = writable(false);

export const tableViewColumns = writable<Column[]>([
    { id: '$id', title: 'Table ID', type: 'string', width: 200 },
    { id: 'name', title: 'Name', type: 'string', width: { min: 120 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 120 } }
]);

export const backupRetainingOptions = [
    { label: '3 Days', value: 3 },
    { label: '1 Week', value: 7 },
    { label: '2 Weeks', value: 14 },
    { label: '1 Month', value: 30 },
    { label: '3 Months', value: 90 },
    { label: '1 Year', value: 365 },
    { label: 'Forever', value: 365 * 100 },
    { label: 'Custom', value: -1 }
];

export const customRetainingOptions = [
    { label: 'Days', value: 1, max: 30 },
    { label: 'Weeks', value: 7, max: 4 },
    { label: 'Months', value: 30, max: 12 }
];

export const databaseSubNavigationItems = [
    { title: 'Backups', href: 'backups', icon: IconCloudUpload },
    { title: 'Settings', href: 'settings', icon: IconCog }
];

export const randomDataModalState = writable<RandomDataSchema>({
    show: false,
    value: 25, // initial value!
    managed: true // true means don't use the one in database/+layout.svelte
});

export const spreadsheetLoading = writable(false);

export const spreadsheetRenderKey = writable('initial');

export function resetSampleFieldsConfig() {
    spreadsheetLoading.set(false);
    isWaterfallFromFaker.set(false);

    randomDataModalState.update((state) => ({
        ...state,
        value: 25,
        show: false
    }));

    // Reset suggestion state
    entityColumnSuggestions.set({
        thinking: false,
        entity: null,
        enabled: false,
        context: null,
        force: false
    });
}

export function buildEntityRoute(page: Page, entityType: string, entityId: string): string {
    return withPath(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]',
            page.params
        ),
        `/${entityType}-${entityId}`
    );
}

/**
 * Returns select queries for all main and related fields in an `Entity`.
 */
export function buildWildcardEntitiesQuery(entity: Entity | null = null): string[] {
    return [
        ...(entity?.fields
            ?.filter((field: Field) => field.status === 'available' && isRelationship(field))
            ?.map((field: Field) => Query.select([`${field.key}.*`])) ?? []),

        Query.select(['*'])
    ];
}

export function extractSortFromQueries(parsedQueries: Map<TagValue, string>) {
    for (const [tagValue, queryString] of parsedQueries.entries()) {
        if (queryString.includes('orderAsc') || queryString.includes('orderDesc')) {
            const isAsc = queryString.includes('orderAsc');
            return {
                column: tagValue.value,
                direction: isAsc ? 'asc' : 'desc'
            };
        }
    }

    return { column: null, direction: 'default' };
}

/**
 * The API appends `$sequence` to any sort without a unique attribute, but always
 * ascending. A lone descending sort therefore becomes `column DESC, _id ASC`, a
 * direction mix neither scan direction of the index can serve, so the engine
 * filesorts the whole table. Pin the tie breaker to the sort's own direction.
 */
export function orderTieBreaker(order: string): string[] {
    const { method, attribute } = JSON.parse(order);
    const needsTieBreaker = attribute && attribute !== '$id' && attribute !== '$sequence';

    return needsTieBreaker && method === 'orderDesc' ? [Query.orderDesc('$sequence')] : [];
}

export function buildGridQueries(
    limit: number,
    offset: number,
    parsedQueries: Map<TagValue, string>,
    table: Entity,
    includeRelationships: boolean = true
) {
    const orderQuery = Array.from(parsedQueries.values()).find(
        (q) => q.includes('orderAsc') || q.includes('orderDesc')
    );

    const queryArray = [Query.limit(limit), Query.offset(offset)];

    // don't override if there's a user created sort!
    if (!orderQuery) {
        queryArray.push(Query.orderDesc(''));
    }

    queryArray.push(
        ...parsedQueries.values(),
        ...(orderQuery ? orderTieBreaker(orderQuery) : []),
        ...(includeRelationships ? buildWildcardEntitiesQuery(table) : [Query.select(['*'])])
    );

    return queryArray;
}

const RELATIONSHIP_CHUNK_SIZE = 10;

function isTooManyQueryValues(error: unknown): boolean {
    return (
        error instanceof AppwriteException && /greater than \d+ values/i.test(error.message ?? '')
    );
}

type EntityRows<T> = { total: number; rows: T[] };

/**
 * Loads a page of the grid, falling back to smaller relationship batches when
 * the API trips its own 500 value limit resolving them for the whole page.
 */
export async function loadGridRows<T extends { $id: string }>(
    entity: Entity,
    buildQueries: (includeRelationships: boolean) => string[],
    fetchRows: (queries: string[]) => Promise<EntityRows<T>>
): Promise<EntityRows<T>> {
    try {
        return await fetchRows(buildQueries(true));
    } catch (error) {
        if (!isTooManyQueryValues(error)) throw error;

        const page = await fetchRows(buildQueries(false));

        return {
            total: page.total,
            rows: await populateRelationships(entity, page.rows, fetchRows)
        };
    }
}

async function populateRelationships<T extends { $id: string }>(
    entity: Entity,
    rows: T[],
    fetchRows: (queries: string[]) => Promise<EntityRows<T>>
): Promise<T[]> {
    const relationshipQueries = buildWildcardEntitiesQuery(entity);

    if (relationshipQueries.length <= 1 || rows.length === 0) return rows;

    const populated = new Map<string, T>();

    await Promise.all(
        chunks(rows, RELATIONSHIP_CHUNK_SIZE).map(async (chunk) => {
            const rowIds = chunk.map((row) => row.$id);

            try {
                const response = await fetchRows([
                    Query.equal('$id', rowIds),
                    Query.limit(rowIds.length),
                    ...relationshipQueries
                ]);

                response.rows.forEach((row) => populated.set(row.$id, row));
            } catch {
                // keep the unpopulated rows for this chunk!
            }
        })
    );

    return rows.map((row) => populated.get(row.$id) ?? row);
}
