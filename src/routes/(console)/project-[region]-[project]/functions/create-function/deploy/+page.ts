import { sdk } from '$lib/stores/sdk';
import { redirect, isRedirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';
import {
    getNestedRootDirectory,
    getRepositoryInfo,
    getDefaultBranch,
    validateBranch
} from '$lib/helpers/github';
import { ID, Runtime, Type } from '@appwrite.io/console';

export const load: PageLoad = async ({ url, params, parent }) => {
    const {
        installations: vcsInstallations,
        runtimesList,
        specificationsList,
        regionalConsoleVariables
    } = await parent();

    const repository = url.searchParams.get('repo') || url.searchParams.get('repository');

    if (!repository) {
        redirect(302, `${base}/project-${params.region}-${params.project}/functions`);
    }

    const info = getRepositoryInfo(repository);
    if (!info) {
        redirect(302, `${base}/project-${params.region}-${params.project}/functions`);
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

    const runtime = url.searchParams.get('runtime');

    // Quick mode - create function and redirect directly to function page
    const quickMode = url.searchParams.get('quick') === 'true';

    if (quickMode) {
        try {
            const runtimeParam = runtime || 'node-18.0';
            const selectedRuntime = runtimeParam as Runtime;

            const entrypoint = url.searchParams.get('entrypoint') || '';
            const installCommand = url.searchParams.get('install') || '';
            const rootDir =
                getNestedRootDirectory(repository) || url.searchParams.get('rootDir') || '.';

            // Get branch - validate provided or use default
            const branchParam = url.searchParams.get('branch');
            let selectedBranch: string;

            if (branchParam) {
                const isValid = await validateBranch(info.owner, info.name, branchParam);
                if (isValid) {
                    selectedBranch = branchParam;
                } else {
                    selectedBranch = (await getDefaultBranch(info.owner, info.name)) || 'main';
                }
            } else {
                selectedBranch = (await getDefaultBranch(info.owner, info.name)) || 'main';
            }

            // Get first available specification
            const specification =
                specificationsList?.specifications?.[0]?.slug || 's-0.5vcpu-512mb';

            // Create function
            const func = await sdk.forProject(params.region, params.project).functions.create({
                functionId: ID.unique(),
                name: info.name,
                runtime: selectedRuntime,
                execute: ['any'],
                entrypoint: entrypoint || undefined,
                commands: installCommand || undefined,
                providerSilentMode: false,
                specification
            });

            // Add auto-generated domain
            await sdk.forProject(params.region, params.project).proxy.createFunctionRule({
                domain: `${ID.unique()}.${regionalConsoleVariables._APP_DOMAIN_FUNCTIONS}`,
                functionId: func.$id
            });

            // Add variables (empty values used as empty strings)
            await Promise.all(
                envVars.map((variable) =>
                    sdk.forProject(params.region, params.project).functions.createVariable({
                        functionId: func.$id,
                        key: variable.key,
                        value: variable.value,
                        secret: false
                    })
                )
            );

            // Create deployment
            await sdk.forProject(params.region, params.project).functions.createTemplateDeployment({
                functionId: func.$id,
                repository: info.name,
                owner: info.owner,
                rootDirectory: rootDir,
                type: Type.Branch,
                reference: selectedBranch,
                activate: true
            });

            // Redirect to function page
            redirect(
                302,
                `${base}/project-${params.region}-${params.project}/functions/function-${func.$id}`
            );
        } catch (e) {
            // Re-throw redirects (they're not errors)
            if (isRedirect(e)) {
                throw e;
            }
            // On error, fall through to show the wizard
            console.error('Quick deploy failed:', e);
        }
    }

    let installations = vcsInstallations || null;
    if (!installations) {
        try {
            installations = await sdk
                .forProject(params.region, params.project)
                .vcs.listInstallations();
        } catch (error) {
            installations = null;
        }
    }

    return {
        envVars,
        runtime,
        runtimesList,
        installations,
        specificationsList,
        repository: {
            url: info.url,
            name: info.name,
            owner: info.owner,
            rootDirectory: getNestedRootDirectory(repository)
        }
    };
};
