<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import { createPlatform } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/web/step1.svelte';
    import Step2 from './wizard/web/step2.svelte';
    import Step3 from './wizard/web/step3.svelte';
    import Step4 from './wizard/step4.svelte';
    import { Dependencies } from '$lib/constants';
    import { onboarding } from '../../store';

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
    title="Add a web platform"
    steps={stepsComponents}
    on:finish={onFinish}
    on:exit={onFinish}
    finalAction="Go to dashboard" />
