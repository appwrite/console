<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { functionList } from './store';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import Step3 from './wizard/step3.svelte';
    import Step4 from './wizard/step4.svelte';
    import Step5 from './wizard/step5.svelte';
    import { createFunction } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { Query } from '@aw-labs/appwrite-console';

    const create = async () => {
        try {
            const response = await sdkForProject.functions.create(
                $createFunction.id ?? 'unique()',
                $createFunction.name,
                $createFunction.execute,
                $createFunction.runtime,
                $createFunction.events,
                $createFunction.schedule,
                $createFunction.timeout
            );
            $createFunction.vars.forEach(
                async (v) =>
                    await sdkForProject.functions.createVariable(response.$id, v.key, v.value)
            );
            addNotification({
                message: 'Function has been created',
                type: 'success'
            });
            functionList.load([Query.limit(6), Query.offset(0), Query.orderDesc('$createdAt')]);
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };

    onDestroy(() => {
        $createFunction = {
            id: null,
            name: null,
            execute: [],
            runtime: null,
            vars: [],
            events: [],
            schedule: null,
            timeout: null
        };
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Function Details',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Execute access',
        component: Step2,
        optional: true
    });
    stepsComponents.set(3, {
        label: 'Events',
        component: Step3,
        optional: true
    });
    stepsComponents.set(4, {
        label: 'Scheduling',
        component: Step4,
        optional: true
    });
    stepsComponents.set(5, {
        label: 'Variables',
        component: Step5,
        optional: true
    });
</script>

<Wizard title="Create Function" steps={stepsComponents} on:finish={create} />
