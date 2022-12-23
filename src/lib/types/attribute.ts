import { isObjectType } from '$lib/helpers/type';
import type { Models } from '@aw-labs/appwrite-console';

export function isStringAttribute(attribute: unknown): attribute is Models.AttributeString {
    return isObjectType<Models.AttributeString>(attribute, {
        key: 'string',
        type: 'string',
        status: 'string',
        required: 'boolean',
        size: 'number',
        array: ['boolean', 'undefined'],
        default: ['string', 'undefined']
    });
}
