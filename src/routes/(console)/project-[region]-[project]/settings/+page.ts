import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

function isReadonlySettingsPermissionError(error: unknown): boolean {
    const code = (error as { code?: number } | null)?.code;
    return code === 401 || code === 403;
}

export const load: PageLoad = async ({ depends, url, params }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);

    const limit = PAGE_LIMIT;
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const variablesOffset = Number(url.searchParams.get('variablesOffset') ?? 0);
    const projectSdk = sdk.forProject(params.region, params.project);
    const [variablesResult, installationsResult] = await Promise.allSettled([
        projectSdk.projectApi.listVariables({
            queries: [Query.limit(limit), Query.offset(variablesOffset)]
        }),
        projectSdk.vcs.listInstallations({
            queries: [Query.limit(limit), Query.offset(offset)]
        })
    ]);

    const variables =
        variablesResult.status === 'fulfilled'
            ? variablesResult.value
            : (() => {
                  // Read-only users can be blocked from write-adjacent settings APIs.
                  // Only silence those permission errors so genuine load failures still surface.
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
                  // Read-only users can be blocked from write-adjacent settings APIs.
                  // Only silence those permission errors so genuine load failures still surface.
                  if (!isReadonlySettingsPermissionError(installationsResult.reason)) {
                      throw installationsResult.reason;
                  }

                  return {
                      total: 0,
                      installations: []
                  };
              })();

    return {
        limit,
        offset,
        variablesOffset,
        variables,
        installations
    };
};
