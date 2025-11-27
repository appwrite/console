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
import { Adapter, BuildRuntime, Framework, ID, Type } from '@appwrite.io/console';

export const load: PageLoad = async ({ url, params, parent }) => {
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

    // Quick mode - create site and redirect directly to deploying page
    const quickMode = url.searchParams.get('quick') === 'true';

    if (quickMode) {
        try {
            const { regionalConsoleVariables } = await parent();

            const preset = url.searchParams.get('preset') || 'nextjs';
            const framework = (Object.values(Framework) as string[]).includes(preset.toLowerCase())
                ? (preset.toLowerCase() as Framework)
                : Framework.Nextjs;

            // Get framework defaults
            const frameworks = await sdk
                .forProject(params.region, params.project)
                .sites.listFrameworks();
            const fw = frameworks.frameworks.find((f) => f.key === framework);

            let installCommand = url.searchParams.get('install') || '';
            let buildCommand = url.searchParams.get('build') || '';
            let outputDirectory = url.searchParams.get('output') || '';

            // Use framework defaults if not provided
            if (!installCommand && !buildCommand && !outputDirectory && fw?.adapters?.length > 0) {
                const adapter = fw.adapters[0];
                installCommand = adapter.installCommand || '';
                buildCommand = adapter.buildCommand || '';
                outputDirectory = adapter.outputDirectory || '';
            }

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

            const rootDir =
                getNestedRootDirectory(repository) || url.searchParams.get('rootDir') || '.';
            const buildRuntime =
                framework === Framework.Other ? BuildRuntime.Static1 : BuildRuntime.Node210;

            // Create site
            const site = await sdk.forProject(params.region, params.project).sites.create({
                siteId: ID.unique(),
                name: info.name,
                framework,
                buildRuntime,
                installCommand: installCommand || undefined,
                buildCommand: buildCommand || undefined,
                outputDirectory: outputDirectory || undefined,
                adapter: framework === Framework.Other ? Adapter.Static : undefined,
                providerSilentMode: false
            });

            // Add auto-generated domain
            await sdk.forProject(params.region, params.project).proxy.createSiteRule({
                domain: `${ID.unique()}.${regionalConsoleVariables._APP_DOMAIN_SITES}`,
                siteId: site.$id
            });

            // Add variables (empty values used as empty strings)
            await Promise.all(
                envVars.map((variable) =>
                    sdk.forProject(params.region, params.project).sites.createVariable({
                        siteId: site.$id,
                        key: variable.key,
                        value: variable.value,
                        secret: false
                    })
                )
            );

            // Create deployment
            const deployment = await sdk
                .forProject(params.region, params.project)
                .sites.createTemplateDeployment({
                    siteId: site.$id,
                    repository: info.name,
                    owner: info.owner,
                    rootDirectory: rootDir,
                    type: Type.Branch,
                    reference: selectedBranch,
                    activate: true
                });

            // Redirect to deploying page
            redirect(
                302,
                `${base}/project-${params.region}-${params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deployment.$id}`
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
