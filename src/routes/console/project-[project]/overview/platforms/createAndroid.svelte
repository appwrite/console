<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import { createPlatform } from './wizard/store';
    import { Dependencies } from '$lib/constants';
    import { onboarding } from '../../store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/android/step1.svelte';
    import Step2 from './wizard/android/step2.svelte';
    import Step3 from './wizard/android/step3.svelte';
    import Step4 from './wizard/step4.svelte';

    async function onFinish() {
        await Promise.all([
            $onboarding && invalidate(Dependencies.PROJECT),
            invalidate(Dependencies.PLATFORMS)
        ]);
        createPlatform.reset();
        wizard.hide();
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Settings',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Install',
        component: Step2,
        optional: true
    });
    stepsComponents.set(3, {
        label: 'Import',
        component: Step3,
        optional: true
    });
    stepsComponents.set(4, {
        label: 'Build',
        component: Step4,
        optional: true
    });
</script>

<Wizard
    title="Add an Android platform"
    steps={stepsComponents}
    on:finish={onFinish}
    on:exit={onFinish}
    finalAction="Go to dashboard" />
