<script lang="ts">
    import { ID } from '@appwrite.io/console';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { beforeNavigate, goto } from '$app/navigation';
    import {
        choices,
        createFunction,
        createFunctionDeployment,
        installation,
        repository
    } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Details from './steps/details.svelte';
    import Configuration from './steps/configuration.svelte';
    import ExecuteAccess from './steps/executeAccess.svelte';

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
            $createFunction.buildCommand
        );
        await sdk.forProject.functions.createDeployment(
            response.$id,
            $createFunctionDeployment.item[0],
            true
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

    beforeNavigate(() => {
        wizard.hide();
    });

    function resetState() {
        createFunction.set({
            $id: null,
            name: null,
            entrypoint: null,
            execute: [],
            runtime: null
        });
        choices.set({
            branch: null,
            silentMode: false,
            rootDir: null
        });
        installation.set(null);
        repository.set(null);
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
