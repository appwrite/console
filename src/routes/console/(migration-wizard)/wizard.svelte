<script lang="ts">
    import { page } from '$app/stores';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { migrationFormToResources } from '$lib/stores/migration';
    import { onDestroy } from 'svelte';
    import { formData, provider } from '.';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const onExit = () => {
        formData.reset();
    };

    const onFinish = async () => {
        const resources = migrationFormToResources($formData);
        if ($provider.provider !== 'appwrite') return;

        const res = await sdk.forProject.migrations.migrateAppwrite(
            resources,
            $provider.endpoint,
            $provider.projectID,
            $provider.apiKey
        );
        console.log('appwrite', res);
        invalidate(Dependencies.MIGRATIONS);
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
