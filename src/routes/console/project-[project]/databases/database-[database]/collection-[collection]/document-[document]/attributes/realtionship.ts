import type { Models } from '@appwrite.io/console';

export function isRelationshipToMany(attribute: Models.AttributeRelationship) {
    if (!attribute) return false;
    const { side, relationType } = attribute || {};
    if (side === 'parent') {
        return !['oneToOne', 'manyToOne'].includes(relationType);
    } else {
        return !['oneToOne', 'oneToMany'].includes(relationType);
    }
}
