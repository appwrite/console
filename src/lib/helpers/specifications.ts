import type { Models } from '@appwrite.io/console';

export function trimLeadingDisabledSpecifications(
    list: Models.SpecificationList
): Models.SpecificationList {
    const firstEnabledIndex = list.specifications.findIndex(({ enabled }) => enabled);
    const specifications =
        firstEnabledIndex === -1 ? [] : list.specifications.slice(firstEnabledIndex);

    return {
        ...list,
        total: specifications.length,
        specifications
    };
}
