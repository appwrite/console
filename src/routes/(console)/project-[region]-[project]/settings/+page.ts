import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { Addon, Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

function isReadonlySettingsPermissionError(error: unknown): boolean {
    const code = (error as { code?: number } | null)?.code;
    return code === 401 || code === 403;
}

export const load: PageLoad = async ({ depends, url, params }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);
    depends(Dependencies.ADDONS);

    const limit = PAGE_LIMIT;
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const variablesOffset = Number(url.searchParams.get('variablesOffset') ?? 0);
    const projectSdk = sdk.forProject(params.region, params.project);
    const [variablesResult, installationsResult, addonsResult, addonPriceResult] =
        await Promise.allSettled([
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
                ? sdk
                      .forConsoleIn(params.region)
                      .projects.getAddonPrice({
                          projectId: params.project,
                          addon: Addon.Premiumgeodb
                      })
                      .catch(() => null)
                : Promise.resolve(null)
        ]);

    const variables =
        variablesResult.status === 'fulfilled'
            ? variablesResult.value
            : (() => {
                  if (!isReadonlySettingsPermissionError(variablesResult.reason)) {
                      throw variablesResult.reason;
                  }

                  return {
                      total: 0,
                      variables: []
                  };
              })();

    const installations =
        installationsResult.status === 'fulfilled'
            ? installationsResult.value
            : (() => {
                  if (!isReadonlySettingsPermissionError(installationsResult.reason)) {
                      throw installationsResult.reason;
                  }

                  return {
                      total: 0,
                      installations: []
                  };
              })();

    const addons = addonsResult.status === 'fulfilled' ? addonsResult.value : null;
    const addonPrice = addonPriceResult.status === 'fulfilled' ? addonPriceResult.value : null;

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
