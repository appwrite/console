import { page } from '$app/state';
import type { Column } from '$lib/helpers/types';
import type { Attributes, Columns } from '../store';
import { type Models, Query } from '@appwrite.io/console';
import type { Entity, Field } from '$database/(entity)';

type RowPrimitive = string | number | bigint | boolean | null | undefined;
interface RowObject {
    [key: string]: RowValue;
}
type RowValue = RowPrimitive | RowValue[] | RowObject;

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

export function isTextType(field: Field): boolean {
    if (!field) return false;
    const textTypes = ['string', 'varchar', 'text', 'mediumtext', 'longtext'];
    return textTypes.includes(field?.type);
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

function castBigIntValue(value: RowValue): RowValue {
    if (value === null || value === undefined || value === '') {
        return value;
    }

    return String(value);
}

export function buildPayload<T extends Record<string, RowValue>>(
    fields: Field[] | undefined,
    row: T
): T {
    const payload = structuredClone(row) as Record<string, RowValue>;

    for (const field of fields ?? []) {
        if (field.type !== 'bigint') {
            continue;
        }

        const value = payload[field.key];

        if (field.array && Array.isArray(value)) {
            payload[field.key] = value.map((item) => castBigIntValue(item));
            continue;
        }

        payload[field.key] = castBigIntValue(value);
    }

    return payload as T;
}

/**
 * Returns select queries for all main and related fields in an `Entity`.
 */
export function buildWildcardColumnsQuery(entity: Entity | null = null): string[] {
    return [
        ...(entity?.fields
            ?.filter((field) => field.status === 'available' && isRelationship(field))
            ?.map((field) => Query.select([`${field.key}.*`])) ?? []),

        Query.select(['*'])
    ];
}

export function buildRowUrl(rowId: string) {
    return `${page.url}/row-${rowId}`;
}
