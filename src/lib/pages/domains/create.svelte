<script lang="ts">
    import { WizardWithSteps } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
    import { dependencyStore, domain } from './wizard/store';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';
    import { realtime } from '$lib/stores/sdk';

    onMount(() => {
        domain.set({ $id: '', domain: '' });

        return realtime
            .forProject(page.params.region, page.params.region)
            .subscribe<Models.ProxyRule>('console', (data) => domain.set(data.payload));
    });

    async function onFinish() {
        await invalidate($dependencyStore);
        wizard.hide();
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Add domain',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Configuration',
        component: Step2
    });
</script>

<WizardWithSteps
    title="Create domain"
    steps={stepsComponents}
    finalAction="Go to console"
    on:exit={onFinish}
    on:finish={onFinish} />
