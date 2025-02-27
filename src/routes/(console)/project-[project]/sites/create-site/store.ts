import { sdk } from '$lib/stores/sdk';
import { consoleVariables } from '$routes/(console)/store';
import { ConsoleResourceType, ID } from '@appwrite.io/console';
import { get } from 'svelte/store';

function toURLSafe(s: string) {
    return s.replace(/[^a-zA-Z0-9-]/g, '-');
}

export async function checkDomain(domain: string) {
    try {
        await sdk.forConsole.console.getResource(
            `${domain}.${get(consoleVariables)._APP_DOMAIN_SITES}`,
            ConsoleResourceType.Rules
        );
        return true;
    } catch {
        return false;
    }
}

export async function buildVerboseDomain(name: string, specifier: string, unique?: string) {
    const safeName = toURLSafe(name).toLowerCase();
    const safeSpecifier = toURLSafe(specifier).toLowerCase();
    const safeUnique = unique ? toURLSafe(unique).toLowerCase() : ID.unique();
    let domain = `${safeName}`;
    if (await checkDomain(domain)) {
        return domain;
    }
    domain = `${safeName}-${safeSpecifier}`;
    if (await checkDomain(domain)) {
        return domain;
    }
    domain = `${safeName}-${safeSpecifier}-${safeUnique}`;
    if (await checkDomain(domain)) {
        return domain;
    }
}
