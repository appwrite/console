<script lang="ts">
    import { ID, Runtime } from '@appwrite.io/console';
    import { WizardWithSteps } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { goto } from '$app/navigation';
    import { choices, createFunction, installation, repository } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import ExecuteAccess from './steps/executeAccess.svelte';
    import GitConfiguration from './steps/gitConfiguration.svelte';
    import FunctionConfiguration from './steps/functionConfiguration.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    async function create() {
        try {
            if (!isValueOfStringEnum(Runtime, $createFunction.runtime)) {
                throw new Error(`Invalid runtime: ${$createFunction.runtime}`);
            }
            const response = await sdk.forProject.functions.create(
                $createFunction.$id || ID.unique(),
                $createFunction.name,
                $createFunction.runtime,
                $createFunction.execute || undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                $createFunction.entrypoint,
                $createFunction.commands || undefined,
                undefined,
                $installation.$id,
                $repository.id,
                $choices.branch,
                $choices.silentMode || undefined,
                $choices.rootDir || undefined
            );
            goto(`${base}/project-${$page.params.project}/functions/function-${response.$id}`);
            addNotification({
                message: `${$createFunction.name} has been created`,
                type: 'success'
            });
            trackEvent(Submit.FunctionCreate, {
                customId: !!$createFunction.$id
            });
            resetState();
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionCreate);
        }
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
        label: 'Git',
        component: GitConfiguration
    });
    stepsComponents.set(2, {
        label: 'Configuration',
        component: FunctionConfiguration
    });
    stepsComponents.set(3, {
        label: 'Execute access',
        component: ExecuteAccess,
        optional: true
    });
</script>

<WizardWithSteps
    title="Create Function"
    steps={stepsComponents}
    on:finish={create}
    on:exit={resetState} />
