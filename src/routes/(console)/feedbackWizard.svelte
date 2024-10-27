<script lang="ts">
    import { WizardWithSteps } from '$lib/layout';
    import { onDestroy } from 'svelte';
    import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
    import { feedbackData } from '$lib/stores/feedback';
    import Step1 from './wizard/feedback/step1.svelte';
    import Step2 from './wizard/feedback/step2.svelte';

    onDestroy(() => {
        feedbackData.reset();
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Feedback',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Thank you',
        component: Step2,
        optional: true
    });
</script>

<WizardWithSteps title="Feedback" steps={stepsComponents} finalAction="Close" />
