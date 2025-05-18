<script lang="ts">
    import { goto, invalidateAll } from '$app/navigation';
    import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
    import Wizard from '$lib/layout/wizardWithSteps.svelte';
    import { migrationFormToResources } from '$lib/stores/migration';
    import { wizard } from '$lib/stores/wizard';
    import { onDestroy } from 'svelte';
    import { formData, provider, selectedProject } from '.';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { requestedMigration } from '$routes/store';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';

    const onExit = () => {
        formData.reset();
        requestedMigration.set(null);
    };

    const onFinish = async () => {
        if ($provider.provider !== 'appwrite') return;
        const resources = migrationFormToResources($formData, $provider.provider);

        await sdk
            .forProject('fra1', $selectedProject)
            .migrations.createAppwriteMigration(
                resources,
                $provider.endpoint,
                $provider.projectID,
                $provider.apiKey
            );

        await invalidateAll();
        wizard.hide();

        goto(`${base}/project-${$selectedProject}/settings/migrations`);
    };

    onDestroy(onExit);

    const steps: WizardStepsType = new Map();
    steps.set(1, {
        label: 'Project',
        component: Step1
    });
    steps.set(2, {
        label: 'Resources',
        component: Step2
    });
</script>

<Wizard title="Create Migration" {steps} on:exit={onExit} on:finish={onFinish} />
