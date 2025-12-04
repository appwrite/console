import { sdk } from '$lib/stores/sdk';
import { redirect, isRedirect } from '@sveltejs/kit';
import { base, resolve } from '$app/paths';
import type { PageLoad } from './$types';
import {
    getNestedRootDirectory,
    getRepositoryInfo,
    getDefaultBranch,
    validateBranch
} from '$lib/helpers/github';
import { parseEnvParam } from '$lib/helpers/env';
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
    const envVars = parseEnvParam(envParam);

    const runtime = url.searchParams.get('runtime');

    // Quick mode - create function and redirect directly to function page
    const quickMode = url.searchParams.get('quick') === 'true';

    if (quickMode) {
        try {
            const runtimeParam = runtime || Runtime.Node22;
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
            const functionPath = resolve(
                '/(console)/project-[region]-[project]/functions/function-[function]',
                {
                    region: params.region,
                    project: params.project,
                    function: func.$id
                }
            );
            redirect(302, functionPath);
        } catch (e) {
            console.error('Failed to create function:', e);
            // Re-throw redirects (they're not errors)
            if (isRedirect(e)) {
                throw e;
            }
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
