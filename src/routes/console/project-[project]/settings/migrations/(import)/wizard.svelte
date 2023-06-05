<script lang="ts">
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { onDestroy } from 'svelte';
    import { data } from '.';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { wizard } from '$lib/stores/wizard';
    import { sdk } from '$lib/stores/sdk';

    const onExit = () => {
        data.reset();
    };
    const onFinish = () => {
        sdk.forConsole.projects;
        data.reset();
        wizard.hide();
    };

    onDestroy(onExit);

    const steps: WizardStepsType = new Map();
    steps.set(1, {
        label: 'Choose provider',
        component: Step1
    });
    steps.set(2, {
        label: 'Select data',
        component: Step2
    });
</script>

<Wizard title="Create Function" {steps} on:exit={onExit} on:finish={onFinish} />
