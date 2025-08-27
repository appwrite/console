import type { Columns } from '../store';
import { type Models, Query } from '@appwrite.io/console';

export function isRelationshipToMany(column: Models.ColumnRelationship) {
    if (!column) return false;
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
