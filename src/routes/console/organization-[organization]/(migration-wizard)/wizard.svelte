<script lang="ts">
    import { page } from '$app/stores';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { migrationFormToResources } from '$lib/stores/migration';
    import { onDestroy } from 'svelte';
    import { formData } from '.';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';

    const onExit = () => {
        formData.reset();
    };

    const onFinish = async () => {
        const resources = migrationFormToResources($formData);
        console.log('resources', resources);
        // wizard.hide();
    };

    onDestroy(onExit);

    const hasProjects = $page.data.allProjects.total > 0;

    const steps: WizardStepsType = new Map();
    steps.set(1, {
        label: hasProjects ? 'Select project' : 'Create project',
        component: Step1
    });
    steps.set(2, {
        label: 'Select data',
        component: Step2
    });
</script>

<Wizard title="Create Function" {steps} on:exit={onExit} on:finish={onFinish} />
