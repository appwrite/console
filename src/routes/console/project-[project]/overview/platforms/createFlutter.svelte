<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { beforeNavigate, invalidate } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import { createPlatform } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/flutter/step1.svelte';
    import Step2 from './wizard/flutter/step2.svelte';
    import Step3 from './wizard/flutter/step3.svelte';
    import Step4 from './wizard/step4.svelte';
    import { Dependencies } from '$lib/constants';
    import { onboarding } from '../../store';

    async function onFinish() {
        if ($onboarding) {
            invalidate(Dependencies.PROJECT);
        }
        invalidate(Dependencies.PLATFORMS);
        createPlatform.reset();
        wizard.hide();
    }

    beforeNavigate(() => {
        wizard.hide();
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Register your app',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Get the SDK',
        component: Step2,
        optional: true
    });
    stepsComponents.set(3, {
        label: "Let's get coding",
        component: Step3,
        optional: true
    });
    stepsComponents.set(4, {
        label: 'All set',
        component: Step4,
        optional: true
    });
</script>

<Wizard
    title="Add a Flutter Project"
    steps={stepsComponents}
    on:finish={onFinish}
    on:exit={onFinish}
    finalAction="Take me to my Dashboard" />
