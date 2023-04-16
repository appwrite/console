<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { beforeNavigate, invalidate } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { domain } from './wizard/store';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import Step3 from './wizard/step3.svelte';
    import Step4 from './wizard/step4.svelte';
    import { onDestroy } from 'svelte';
    import { Dependencies } from '$lib/constants';

    onDestroy(() => {
        domain.set({ $id: '', domain: '' });
    });

    beforeNavigate(() => {
        wizard.hide();
    });

    async function onFinish() {
        await invalidate(Dependencies.DOMAINS);
        wizard.hide();
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Add your domain',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Add a CNAME Record',
        component: Step2,
        optional: true
    });
    stepsComponents.set(3, {
        label: 'Verify domain',
        component: Step3,
        optional: true
    });
    stepsComponents.set(4, {
        label: 'SSL Certificate',
        component: Step4,
        optional: true
    });
</script>

<Wizard
    title="Create domain"
    steps={stepsComponents}
    finalAction="Go to console"
    on:exit={onFinish}
    on:finish={onFinish} />
