<script lang="ts">
    import { ID } from '@appwrite.io/console';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { goto } from '$app/navigation';
    import { choices, installation, repository, template, templateConfig } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import GitConfiguration from './steps/gitConfiguration.svelte';
    import TemplateConfiguration from './steps/templateConfiguration.svelte';
    import RepositoryBehaviour from './steps/repositoryBehaviour.svelte';
    import CreateRepository from './steps/createRepository.svelte';
    import TemplateVariables from './steps/templateVariables.svelte';
    import { scopes } from '$lib/constants';

    async function create() {
        try {
            const runtimeDetail = $template.runtimes.find(
                (r) => r.name === $templateConfig.runtime
            );
            if ($templateConfig.appwriteApiKey) {
                $templateConfig.variables['APPWRITE_API_KEY'] = $templateConfig.appwriteApiKey;
            } else if ($templateConfig?.generateKey) {
                const key = await sdk.forConsole.projects.createKey(
                    $page.params.project,
                    'Generated for Template',
                    scopes.map((scope) => scope.scope)
                );
                $templateConfig.variables['APPWRITE_API_KEY'] = key.secret;
            }
            const response = await sdk.forProject.functions.create(
                $templateConfig.$id || ID.unique(),
                $templateConfig.name,
                $templateConfig.runtime,
                runtimeDetail.entrypoint,
                $template.permissions || undefined,
                $template.events || undefined,
                $template.cron || undefined,
                $template.timeout || undefined,
                undefined,
                undefined,
                runtimeDetail.commands || undefined,
                $installation.$id,
                $repository.id,
                $choices.branch,
                $choices.silentMode || undefined,
                $choices.rootDir || undefined,
                $template.providerRepositoryId,
                $template.providerOwner,
                runtimeDetail.providerRootDirectory,
                $template.providerBranch
            );
            goto(
                `${base}/console/project-${$page.params.project}/functions/function-${response.$id}`
            );
            addNotification({
                message: `${response.name} has been created`,
                type: 'success'
            });
            trackEvent(Submit.FunctionCreate, {
                customId: !!response.$id
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
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Template configuration',
        component: TemplateConfiguration
    });
    stepsComponents.set(2, {
        label: 'Variables',
        component: TemplateVariables
    });
    stepsComponents.set(3, {
        label: 'Repository behaviour',
        component: RepositoryBehaviour
    });
    stepsComponents.set(4, {
        label: 'Select repository',
        component: CreateRepository
    });
    stepsComponents.set(5, {
        label: 'Git configuration',
        component: GitConfiguration
    });
</script>

<Wizard title="Create Function" steps={stepsComponents} on:finish={create} on:exit={resetState} />
