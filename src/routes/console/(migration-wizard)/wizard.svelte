<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { migrationFormToResources } from '$lib/stores/migration';
    import { getSdkForProject } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { onDestroy } from 'svelte';
    import { formData, provider, selectedProject } from '.';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { requestedMigration } from '$routes/store';

    const onExit = () => {
        formData.reset();
        requestedMigration.set(null);
    };

    const onFinish = async () => {
        const resources = migrationFormToResources($formData);
        if ($provider.provider !== 'appwrite') return;

        await getSdkForProject($selectedProject).migrations.createAppwriteMigration(
            resources,
            $provider.endpoint,
            $provider.projectID,
            $provider.apiKey
        );

        await invalidateAll();
        wizard.hide();

        goto(`/console/project-${$selectedProject}/settings/migrations`);
    };

    onDestroy(onExit);

    const steps: WizardStepsType = new Map();
    steps.set(1, {
        label: 'Select project',
        component: Step1
    });
    steps.set(2, {
        label: 'Select data',
        component: Step2
    });
</script>

<Wizard title="Create Project" {steps} on:exit={onExit} on:finish={onFinish} />
