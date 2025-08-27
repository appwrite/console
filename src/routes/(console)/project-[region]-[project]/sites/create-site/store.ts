import { sdk } from '$lib/stores/sdk';
import { ConsoleResourceType, ID } from '@appwrite.io/console';

function toURLSafe(s: string) {
    return s.replace(/[^a-zA-Z0-9-]/g, '-');
}

export async function checkDomain(domain: string, apex: string) {
    try {
        await sdk.forConsole.console.getResource({
            value: `${domain}.${apex}`,
            type: ConsoleResourceType.Rules
        });
        return true;
    } catch {
        return false;
    }
}

export async function buildVerboseDomain(
    apex: string,
    name: string,
    specifier: string,
    secondarySpecifier?: string,
    unique?: string
) {
    const safeName = toURLSafe(name).toLowerCase();
    const safeSpecifier = toURLSafe(specifier).toLowerCase();
    const safeSecondarySpecifier = secondarySpecifier
        ? toURLSafe(secondarySpecifier).toLowerCase()
        : '';
    const safeUnique = unique ? toURLSafe(unique).toLowerCase() : ID.unique();
    let domain = `${safeName}`;
    if (domain && (await checkDomain(domain, apex))) {
        return domain;
    }

    if (domain) {
        domain += '-';
    }

    domain += safeSpecifier;
    if (await checkDomain(domain, apex)) {
        return domain;
    }
    if (secondarySpecifier) {
        domain += '-' + safeSecondarySpecifier;
        if (await checkDomain(domain, apex)) {
            return domain;
        }
    }
    domain += '-' + safeUnique;
    if (await checkDomain(domain, apex)) {
        return domain;
    }

    return ID.unique();
}
