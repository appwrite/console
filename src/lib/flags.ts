import { env } from '$env/dynamic/public';

export const PUBLIC_CONSOLE_FEATURE_FLAGS = env.PUBLIC_CONSOLE_FEATURE_FLAGS ?? '';

function setupFlag(name: string, _description: string) {
    // TODO: Use flags library that provides visual component during development

    if (PUBLIC_CONSOLE_FEATURE_FLAGS.includes(name)) {
        return true;
    }

    // TODO: Check team prefs

    // TODO: Check user prefs

    return false;
}

export const flags = {
    showSites: setupFlag('sites', 'When disabled, sites view will show high demand'),
    showCsvImport: setupFlag('csv-import', 'When disabled, documents view will hide import button')
};
