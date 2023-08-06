<script lang="ts">
    import { ID } from '@appwrite.io/console';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { goto } from '$app/navigation';
    import { choices, installation, repository, template, templateConfig } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import GitConfiguration from './steps/gitConfiguration.svelte';
    import TemplateConfiguration from './steps/templateConfiguration.svelte';
    import RepositoryBehaviour from './steps/repositoryBehaviour.svelte';
    import CreateRepository from './steps/createRepository.svelte';

    async function create() {
        const runtimeDetail = $template.runtimes.find((r) => r.name === $templateConfig.runtime);

        const response = await sdk.forProject.functions.create(
            $templateConfig.$id || ID.unique(),
            $templateConfig.name,
            $templateConfig.runtime,
            $template.permissions || undefined,
            runtimeDetail.entrypoint,
            $template.events || undefined,
            $template.cron || undefined,
            $template.timeout || undefined,
            undefined,
            undefined,
            runtimeDetail.commands,
            $installation.$id,
            $repository.id,
            $choices.branch,
            $choices.silentMode || undefined,
            $choices.rootDir,
            $template.providerRepositoryId,
            $template.providerOwner,
            runtimeDetail.providerRootDirectory,
            $template.providerBranch
        );
        goto(`${base}/console/project-${$page.params.project}/functions/function-${response.$id}`);
        addNotification({
            message: `${response.name} has been created`,
            type: 'success'
        });
        trackEvent(Submit.FunctionCreate, {
            customId: !!response.$id
        });
        resetState();
        wizard.hide();
    }

    function resetState() {
        wizard.hide();
        templateConfig.set(null);
        template.set(null);
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Function configuration',
        component: TemplateConfiguration
    });
    stepsComponents.set(2, {
        label: 'Repository behaviour',
        component: RepositoryBehaviour
    });
    stepsComponents.set(3, {
        label: 'Select repository',
        component: CreateRepository
    });
    stepsComponents.set(4, {
        label: 'Git configuration',
        component: GitConfiguration
    });
</script>

<Wizard title="Create Function" steps={stepsComponents} on:finish={create} on:exit={resetState} />
