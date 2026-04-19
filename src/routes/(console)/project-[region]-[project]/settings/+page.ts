import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { Addon, Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url, params }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);
    depends(Dependencies.ADDONS);
    const limit = PAGE_LIMIT;
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const variablesOffset = Number(url.searchParams.get('variablesOffset') ?? 0);
    const projectSdk = sdk.forProject(params.region, params.project);
    const [variables, installations, addons, addonPrice] = await Promise.all([
        projectSdk.projectApi.listVariables({
            queries: [Query.limit(limit), Query.offset(variablesOffset)]
        }),
        projectSdk.vcs.listInstallations({
            queries: [Query.limit(limit), Query.offset(offset)]
        }),
        isCloud
            ? sdk
                .forConsoleIn(params.region)
                .projects.listAddons({ projectId: params.project })
                .catch(() => null)
            : Promise.resolve(null),
        isCloud
            ? sdk.forConsoleIn(params.region)
                .projects
                .getAddonPrice({
                    projectId: params.project,
                    addon: Addon.Premiumgeodb
                })
                .catch(() => null)
            : Promise.resolve(null)
    ]);

    return {
        limit,
        offset,
        variablesOffset,
        variables,
        installations,
        addons,
        addonPrice
    };
};
