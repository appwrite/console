export function getOrganizationIdFromUrl(pathname: string) {
    // TODO: use base path from svelte here
    const regex = /\/console\/organization-([^/]+)(\/.*)?/;
    const match = pathname.match(regex);

    if (match) {
        return match[1];
    }

    throw new Error('Organization ID not found in pathname');
}

export function getProjectIdFromUrl(pathname: string) {
    // TODO: use base path from svelte here
    const regex = /\/console\/project-(?:[a-z]{2,3}-)?([^/]+)(\/.*)?/;
    const match = pathname.match(regex);

    if (match) {
        return match[1];
    }

    throw new Error('Project ID not found in pathname');
}
