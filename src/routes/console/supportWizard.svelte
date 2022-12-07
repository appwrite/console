<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { onDestroy } from 'svelte';
    import { supportData } from './wizard/store';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';

    onDestroy(() => {
        $supportData = {
            name: null,
            email: null,
            message: null,
            file: null
        };
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'How can we help you?',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Your message has been sent',
        component: Step2
    });

    //TODO: replace steps with text add side text
</script>

<Wizard title="Contact us" steps={stepsComponents} />
