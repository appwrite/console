<script lang="ts">
    import { ID } from '@appwrite.io/console';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { goto } from '$app/navigation';
    import { choices, createFunction, installation, repository } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import ExecuteAccess from './steps/executeAccess.svelte';
    import SelectRepository from './steps/selectRepository.svelte';
    import GitConfiguration from './steps/gitConfiguration.svelte';
    import FunctionConfiguration from './steps/functionConfiguration.svelte';

    async function create() {
        const response = await sdk.forProject.functions.create(
            $createFunction.$id || ID.unique(),
            $createFunction.name,
            $createFunction.runtime,
            $createFunction.execute || undefined,
            $createFunction.entrypoint,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            $createFunction.commands,
            $installation.$id,
            $repository.id,
            $choices.branch,
            $choices.silentMode,
            $choices.rootDir
        );
        goto(`${base}/console/project-${$page.params.project}/functions/function-${response.$id}`);
        addNotification({
            message: `${$createFunction.name} has been created`,
            type: 'success'
        });
        trackEvent(Submit.FunctionCreate, {
            customId: !!$createFunction.$id
        });
        resetState();
        wizard.hide();
    }

    function resetState() {
        createFunction.set({
            $id: null,
            name: null,
            entrypoint: null,
            execute: [],
            runtime: null
        });
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Select Repository',
        component: SelectRepository
    });
    stepsComponents.set(2, {
        label: 'Git configuration',
        component: GitConfiguration
    });
    stepsComponents.set(3, {
        label: 'Function configuration',
        component: FunctionConfiguration
    });
    stepsComponents.set(4, {
        label: 'Execute access',
        component: ExecuteAccess,
        optional: true
    });
</script>

<Wizard title="Create Function" steps={stepsComponents} on:finish={create} on:exit={resetState} />
