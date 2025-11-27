import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { getNestedRootDirectory, getRepositoryInfo } from '$lib/helpers/github';

export const load: PageLoad = async ({ url, params }) => {
    const repository = url.searchParams.get('repo') || url.searchParams.get('repository');

    if (!repository) {
        redirect(302, `${base}/project-${params.region}-${params.project}/sites`);
    }

    const info = getRepositoryInfo(repository);
    if (!info) {
        redirect(302, `${base}/project-${params.region}-${params.project}/sites`);
    }

    const envParam = url.searchParams.get('env');

    // Parse env vars - supports KEY or KEY=value format
    const envVars: Array<{ key: string; value: string }> = envParam
        ? envParam.split(',').map((entry: string) => {
              const trimmed = entry.trim();
              const eqIndex = trimmed.indexOf('=');
              if (eqIndex === -1) {
                  return { key: trimmed, value: '' };
              }
              return {
                  key: trimmed.substring(0, eqIndex),
                  value: trimmed.substring(eqIndex + 1)
              };
          })
        : [];

    const [frameworks, installations] = await Promise.all([
        sdk.forProject(params.region, params.project).sites.listFrameworks(),
        sdk
            .forProject(params.region, params.project)
            .vcs.listInstallations()
            .catch(() => null)
    ]);

    return {
        envVars,
        frameworks,
        installations,
        repository: {
            url: info.url,
            name: info.name,
            owner: info.owner,
            rootDirectory: getNestedRootDirectory(repository)
        }
    };
};
