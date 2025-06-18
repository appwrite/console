import { env } from '$env/dynamic/public';
import type { Account } from './stores/user';
import type { Organization } from './stores/organization';

// Parse feature flags from env as a string array (exact match only)
const flagsRaw = (env.PUBLIC_CONSOLE_FEATURE_FLAGS ?? '').split(',');

function isFlagEnabled(name: string) {
    // loose generic to allow safe access while retaining type safety
    return <T extends { account?: Account; organization?: Organization }>(data: T) => {
        const { account, organization } = data;

        return !!(
            flagsRaw.includes(name) ||
            account?.prefs?.[`flags-${name}`] ||
            organization?.prefs?.[`flags-${name}`]
        );
    };
}

export const flags = {
    showSites: isFlagEnabled('sites'),
    showCsvImport: isFlagEnabled('csv-import'),
    showAttributeEncrypt: isFlagEnabled('attribute-encrypt'),
    showIndexLengths: isFlagEnabled('index-lengths')
};
