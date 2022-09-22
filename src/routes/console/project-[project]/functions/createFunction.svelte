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

    const create = async () => {
        try {
            await sdkForProject.functions.create(
                $createFunction.id ?? 'unique()',
                $createFunction.name,
                $createFunction.execute,
                $createFunction.runtime,
                $createFunction.vars,
                $createFunction.events,
                $createFunction.schedule,
                $createFunction.timeout
            );
            addNotification({
                message: 'Document has been created',
                type: 'success'
            });
            functionList.load('', 12, 0);
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };

    onDestroy(() => {
        $createFunction.execute = [];
        $createFunction.events = [];
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Function Details',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Execute access',
        component: Step2
    });
    stepsComponents.set(3, {
        label: 'Events',
        component: Step3
    });
    stepsComponents.set(4, {
        label: 'Scheduling',
        component: Step4
    });
    stepsComponents.set(5, {
        label: 'Variables',
        component: Step5
    });
</script>

<Wizard title="Create Function" steps={stepsComponents} on:finish={create} />
