import { env } from '$env/dynamic/public';
import type { Organization } from './stores/organization';
import type { Account } from './stores/user';

export const PUBLIC_CONSOLE_FEATURE_FLAGS = env.PUBLIC_CONSOLE_FEATURE_FLAGS ?? '';

function setupFlag(name: string, _description: string) {
    // TODO: Use flags library that provides visual component during development

    return (user: Account, organization: Organization) => {
        if (PUBLIC_CONSOLE_FEATURE_FLAGS.includes(name)) {
            return true;
        }

        const userPrefs = user?.prefs ?? {};
        const userFlag = userPrefs[`flags-${name}`] ?? null;
        if (userFlag) {
            return true;
        }

        const organizationPrefs = organization?.prefs ?? {};
        const organizationFlag = organizationPrefs[`flags-${name}`] ?? null;
        if (organizationFlag) {
            return true;
        }

        return false;
    };
}

export const flags = {
    showSites: setupFlag('sites', 'When disabled, sites view will show high demand'),
    showCsvImport: setupFlag('csv-import', 'When disabled, documents view will hide import button')
};
