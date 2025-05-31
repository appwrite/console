import { getFlagUrl } from '$lib/helpers/flag';
import type { Models } from '@appwrite.io/console';

type RegionOption = {
    label: string;
    value: string;
    disabled: boolean;
    leadingHtml: string;
};

export function filterRegions(regions: Models.ConsoleRegion[]): RegionOption[] {
    if (!regions.length) return [];

    return regions
        .filter((region) => region.$id !== 'default')
        .sort((a, b) => {
            if (a.disabled && !b.disabled) return 1;
            if (!a.disabled && b.disabled) return -1;
            return a.name.localeCompare(b.name);
        })
        .map((region) => ({
            label: region.name,
            value: region.$id,
            disabled: region.disabled || !region.available,
            leadingHtml: `<img src='${getFlagUrl(region.flag)}' alt='Region flag'/>`
        }));
}
