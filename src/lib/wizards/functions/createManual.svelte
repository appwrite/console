<script lang="ts">
    import { ID, Runtime } from '@appwrite.io/console';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { goto } from '$app/navigation';
    import {
        choices,
        createFunction,
        createFunctionDeployment,
        installation,
        repository
    } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Details from './steps/manualDetails.svelte';
    import Configuration from './steps/manualConfiguration.svelte';
    import ExecuteAccess from './steps/executeAccess.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    async function create() {
        try {
            if (!isValueOfStringEnum(Runtime, $createFunction.runtime)) {
                throw new Error(`Invalid runtime: ${$createFunction.runtime}`);
            }
            const response = await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.create(
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
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    $createFunction.specification
                );
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.createDeployment(response.$id, $createFunctionDeployment[0], true);
            goto(
                `${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${response.$id}`
            );
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
        createFunction.reset();
        choices.set({
            branch: null,
            silentMode: false,
            rootDir: null
        });
        installation.set(null);
        repository.set(null);
        createFunctionDeployment.set(null);
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Details',
        component: Details
    });
    stepsComponents.set(2, {
        label: 'Configuration',
        component: Configuration
    });
    stepsComponents.set(3, {
        label: 'Execute access',
        component: ExecuteAccess,
        optional: true
    });
</script>

<Wizard title="Create Function" steps={stepsComponents} on:finish={create} on:exit={resetState} />
