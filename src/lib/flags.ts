import { env } from '$env/dynamic/public';

export const PUBLIC_CONSOLE_FEATURE_FLAGS = env.PUBLIC_CONSOLE_FEATURE_FLAGS ?? '';

function setupFlag(name: string, _description: string) {
    // TODO: Use flags library that provides visual component
    return PUBLIC_CONSOLE_FEATURE_FLAGS.includes(name);
}

export const flags = {
    showSites: setupFlag('sites', 'When disabled, sites view will show high demand'),
    showCsvImport: setupFlag('csv-import', 'When disabled, documents view will hide import button')
};
