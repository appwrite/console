import { isValueOfStringEnum } from '$lib/helpers/types';
import { Flag } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';

export function getFlagUrl(countryCode: string) {
    if (!isValueOfStringEnum(Flag, countryCode)) return '';
    return sdk.forConsole.avatars
        .getFlag({ code: countryCode, width: 22, height: 15, quality: 100 })
        ?.toString();
}
