import { type Models, Query } from '@appwrite.io/console';
import type { Columns } from '../../store';

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
            ?.filter((col) => isRelationship(col))
            ?.map((col) => Query.select([`${col.key}.*`])) ?? []),

        Query.select(['*'])
    ];
}
