import { page } from '$app/state';
import type { Field } from '$database/(entity)';
import type { Column } from '$lib/helpers/types';
import { type Models } from '@appwrite.io/console';
import type { Attributes, Columns } from '../../store';

export function isRelationshipToMany(field: Field) {
    if (!field) return false;
    if (!isRelationship(field)) return false;

    const column = field as Models.ColumnRelationship | Models.AttributeRelationship;

    if (!column?.relationType) return false;
    if (column?.side === 'child') {
        return !['oneToOne', 'oneToMany'].includes(column?.relationType);
    } else {
        return !['oneToOne', 'manyToOne'].includes(column?.relationType);
    }
}

export function isRelationship(
    field: Field
): field is Models.ColumnRelationship | Models.AttributeRelationship {
    if (!field) return false;
    return field?.type === 'relationship';
}

export function isString(field: Field): field is Models.ColumnString | Models.AttributeString {
    if (!field) return false;
    return field?.type === 'string';
}

export function isSpatialType(
    field: Columns | Attributes | Column
): field is
    | Models.ColumnPoint
    | Models.ColumnLine
    | Models.ColumnPolygon
    | Models.AttributePoint
    | Models.AttributeLine
    | Models.AttributePolygon {
    if (!field) return false;

    const spatialTypes = ['point', 'linestring', 'polygon'];

    return spatialTypes.includes(field.type.toLowerCase());
}

export function buildRowUrl(rowId: string) {
    return `${page.url}/row-${rowId}`;
}
