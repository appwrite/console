import { Framework, type Models } from '@appwrite.io/console';

export function getEnumFromModel(model: Models.Framework): Framework {
    return Framework[model.name];
}
