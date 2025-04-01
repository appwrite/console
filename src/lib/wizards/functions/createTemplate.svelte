<script lang="ts">
    import { ID, Runtime } from '@appwrite.io/console';
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { goto } from '$app/navigation';
    import {
        choices,
        installation,
        repository,
        template,
        templateConfig,
        templateStepsComponents
    } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import TemplateConfiguration from './steps/templateConfiguration.svelte';
    import TemplatePermissions from './steps/templatePermissions.svelte';
    import TemplateVariables from './steps/templateVariables.svelte';
    import TemplateDeployment from './steps/templateDeployment.svelte';
    import CreateRepository from './steps/createRepository.svelte';
    import GitConfiguration from './steps/gitConfiguration.svelte';

    async function create() {
        try {
            if (!isValueOfStringEnum(Runtime, $templateConfig.runtime)) {
                throw new Error(`Invalid runtime: ${$templateConfig.runtime}`);
            }
            const runtimeDetail = $template.runtimes.find(
                (r) => r.name === $templateConfig.runtime
            );

            const response = await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.create(
                    $templateConfig.$id || ID.unique(),
                    $templateConfig.name,
                    $templateConfig.runtime,
                    $templateConfig?.execute ? $template.permissions || undefined : undefined,
                    $template.events || undefined,
                    $template.cron || undefined,
                    $template.timeout || undefined,
                    undefined,
                    undefined,
                    runtimeDetail.entrypoint,
                    runtimeDetail.commands || undefined,
                    $templateConfig?.scopes?.length ? $templateConfig.scopes : undefined,
                    $templateConfig.repositoryBehaviour === 'manual'
                        ? undefined
                        : $installation.$id,
                    $templateConfig.repositoryBehaviour === 'manual' ? undefined : $repository.id,
                    $templateConfig.repositoryBehaviour === 'manual' ? undefined : $choices.branch,
                    $templateConfig.repositoryBehaviour === 'manual'
                        ? undefined
                        : $choices.silentMode || undefined,
                    $templateConfig.repositoryBehaviour === 'manual'
                        ? undefined
                        : $choices.rootDir || undefined,
                    $template.providerRepositoryId || undefined,
                    $template.providerOwner || undefined,
                    runtimeDetail.providerRootDirectory || undefined,
                    $template.providerVersion || undefined,
                    $templateConfig.specification || undefined
                );

            if ($templateConfig.variables) {
                const promises = Object.entries($templateConfig.variables).map(([key, value]) =>
                    sdk
                        .forProject($page.params.region, $page.params.project)
                        .functions.createVariable(response.$id, key, value?.toString())
                );

                await Promise.all(promises);
            }

            goto(
                `${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${response.$id}`
            );
            addNotification({
                message: `${response.name} has been created`,
                type: 'success'
            });
            trackEvent(Submit.FunctionCreate, {
                customId: !!response.$id,
                runtime: response.runtime,
                deployment_type: $templateConfig.repositoryBehaviour,
                scopes: $templateConfig.scopes,
                specification: $templateConfig.specification
            });
            resetState();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionCreate);
        }
    }
    function resetState() {
        wizard.hide();
        templateConfig.set(null);
        template.set(null);
        installation.set(null);
    }

    $templateStepsComponents.set(1, {
        label: 'Configuration',
        component: TemplateConfiguration
    });
    $templateStepsComponents.set(2, {
        label: 'Permissions',
        component: TemplatePermissions
    });
    $templateStepsComponents.set(3, {
        label: 'Variables',
        component: TemplateVariables,
        disabled: !$template?.variables?.length
    });
    $templateStepsComponents.set(4, {
        label: 'Deployment',
        component: TemplateDeployment
    });
    $templateStepsComponents.set(5, {
        label: 'Repository',
        component: CreateRepository
    });
    $templateStepsComponents.set(6, {
        label: 'Branch',
        component: GitConfiguration
    });
</script>

<Wizard
    title="Create Function"
    steps={$templateStepsComponents}
    on:finish={create}
    on:exit={resetState} />
