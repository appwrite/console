import { page } from '$app/state';
import type { Column } from '$lib/helpers/types';
import type { Columns } from '../store';
import { type Models, Query } from '@appwrite.io/console';

export function isRelationshipToMany(col: Columns) {
    if (!col) return false;
    if (!isRelationship(col)) return false;

    const column = col as Models.ColumnRelationship;

    if (!column?.relationType) return false;
    if (column?.side === 'child') {
        return !['oneToOne', 'oneToMany'].includes(column?.relationType);
    } else {
        return !['oneToOne', 'manyToOne'].includes(column?.relationType);
    }
}

export function isRelationship(column: Columns): column is Models.ColumnRelationship {
    if (!column) return false;
    return column?.type === 'relationship';
}

export function isString(column: Columns): column is Models.ColumnString {
    if (!column) return false;
    return column?.type === 'string';
}

export function isSpatialType(
    column: Columns | Column
): column is Models.ColumnPoint | Models.ColumnLine | Models.ColumnPolygon {
    if (!column) return false;

    const spatialTypes = ['point', 'linestring', 'polygon'];

    return spatialTypes.includes(column.type.toLowerCase());
}

/**
 * Returns select queries for all main and related fields in a table.
 */
export function buildWildcardColumnsQuery(table: Models.Table | null = null): string[] {
    return [
        ...(table?.columns
            ?.filter((col) => col.status === 'available' && isRelationship(col))
            ?.map((col) => Query.select([`${col.key}.*`])) ?? []),

        Query.select(['*'])
    ];
}

export function buildRowUrl(rowId: string) {
    return `${page.url}/row-${rowId}`;
}
