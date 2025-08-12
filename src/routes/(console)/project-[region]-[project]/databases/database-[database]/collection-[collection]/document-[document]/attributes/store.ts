import { type Models, Query } from '@appwrite.io/console';
import type { Attributes } from '../../store';

export function isRelationshipToMany(attribute: Models.AttributeRelationship) {
    if (!attribute) return false;
    if (!attribute?.relationType) return false;
    if (attribute?.side === 'child') {
        return !['oneToOne', 'oneToMany'].includes(attribute?.relationType);
    } else {
        return !['oneToOne', 'manyToOne'].includes(attribute?.relationType);
    }
}

export function isRelationship(attribute: Attributes): attribute is Models.AttributeRelationship {
    if (!attribute) return false;
    return attribute?.type === 'relationship';
}

export function isString(attribute: Attributes): attribute is Models.AttributeString {
    if (!attribute) return false;
    return attribute?.type === 'string';
}

/**
 * Returns select queries for all main and related fields in a collection.
 */
export function buildWildcardAttributesQuery(
    collection: Models.Collection | null = null
): string[] {
    return [
        ...(collection?.attributes
            ?.filter((attr) => attr.status === 'available' && isRelationship(attr))
            ?.map((attr) => Query.select([`${attr.key}.*`])) ?? []),

        Query.select(['*'])
    ];
}
