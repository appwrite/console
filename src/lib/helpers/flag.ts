import { isValueOfStringEnum } from '$lib/helpers/types';
import { Flag } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';

export function getFlagUrl(countryCode: string) {
    if (!isValueOfStringEnum(Flag, countryCode)) return '';
    return sdk.forConsole.avatars.getFlag(countryCode, 22, 15, 100)?.toString();
}
