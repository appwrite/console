<script lang="ts">
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/react-native/step1.svelte';
    import Step2 from './wizard/react-native/step2.svelte';
    import Step3 from './wizard/react-native/step3.svelte';
    import Step4 from './wizard/step4.svelte';

    import Skipped, { onPlatformSetupFinish } from './wizard/skipped.svelte';

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
    title="Add a React Native platform"
    steps={stepsComponents}
    manualExitControl
    on:finish={onPlatformSetupFinish}
    on:exit={onPlatformSetupFinish}
    finalAction="Go to dashboard" />

<Skipped />
