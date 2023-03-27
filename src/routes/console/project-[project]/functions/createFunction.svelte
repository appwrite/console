<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
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
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@appwrite.io/console';

    const projectId = $page.params.project;

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }
    async function create() {
        try {
            const response = await sdk.forProject.functions.create(
                $createFunction.id ?? ID.unique(),
                $createFunction.name,
                $createFunction.runtime,
                $createFunction.execute || undefined,
                $createFunction.events || undefined,
                $createFunction.schedule || undefined,
                $createFunction.timeout || undefined
            );
            await Promise.all(
                $createFunction.vars.map((v) =>
                    sdk.forProject.functions.createVariable(response.$id, v.key, v.value)
                )
            );
            await invalidate(Dependencies.FUNCTIONS);
            goto(`${base}/console/project-${projectId}/functions/function-${response.$id}`);
            addNotification({
                message: `${$createFunction.name} has been created`,
                type: 'success'
            });
            trackEvent(Submit.FunctionCreate, {
                customId: !!$createFunction.id
            });
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionCreate);
        }
    }

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
        label: 'Details',
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
        label: 'Schedule',
        component: Step4,
        optional: true
    });
    stepsComponents.set(5, {
        label: 'Variables',
        component: Step5,
        optional: true
    });
</script>

<Wizard title="Create Function" steps={stepsComponents} on:finish={create} on:exit={onFinish} />
