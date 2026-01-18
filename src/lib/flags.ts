import { env } from '$env/dynamic/public';
import type { Account } from './stores/user';
import type { Models } from '@appwrite.io/console';

// Parse feature flags from env as a string array (exact match only)
const flagsRaw = (env.PUBLIC_CONSOLE_FEATURE_FLAGS ?? '').split(',');

// @ts-expect-error: unused method!
function isFlagEnabled(name: string) {
    // loose generic to allow safe access while retaining type safety
    return <T extends { account?: Account; organization?: Models.Organization }>(data: T) => {
        const { account, organization } = data;

        return !!(
            flagsRaw.includes(name) ||
            account?.prefs?.[`flags-${name}`] ||
            organization?.prefs?.[`flags-${name}`]
        );
    };
}

export const flags = {};
