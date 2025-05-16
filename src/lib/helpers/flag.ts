import { isValueOfStringEnum } from '$lib/helpers/types';
import { Flag } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';

export function getFlagUrl(countryCode: string) {
    if (!isValueOfStringEnum(Flag, countryCode)) return '';
    return sdk
        .forProject(page.params.region, 'console')
        .avatars.getFlag(countryCode, 22, 15, 100)
        ?.toString();
}
