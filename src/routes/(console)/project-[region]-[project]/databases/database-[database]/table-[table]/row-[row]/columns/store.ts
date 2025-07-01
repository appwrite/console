import type { Models } from '@appwrite.io/console';
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
