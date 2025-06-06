import { env } from '$env/dynamic/public';
import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { organization } from '$lib/stores/organization';

export const PUBLIC_CONSOLE_FEATURE_FLAGS = env.PUBLIC_CONSOLE_FEATURE_FLAGS ?? '';

function setupFlag(name: string, _description: string) {
    // TODO: Use flags library that provides visual component during development

    if (PUBLIC_CONSOLE_FEATURE_FLAGS.includes(name)) {
        return true;
    }

    const userInstance = get(user);
    const userPrefs = userInstance?.prefs ?? {};
    const userFlag = userPrefs[`flags-${name}`] ?? null;
    if (userFlag) {
        return true;
    }

    const organizationInstance = get(organization);
    const organizationPrefs = organizationInstance?.prefs ?? {};
    const organizationFlag = organizationPrefs[`flags-${name}`] ?? null;
    if (organizationFlag) {
        return true;
    }

    return false;
}

export const flags = {
    showSites: setupFlag('sites', 'When disabled, sites view will show high demand'),
    showCsvImport: setupFlag('csv-import', 'When disabled, documents view will hide import button')
};
