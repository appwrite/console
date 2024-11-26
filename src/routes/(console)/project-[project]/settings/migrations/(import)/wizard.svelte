<script lang="ts">
    import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
    import Wizard from '$lib/layout/wizardWithSteps.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { onDestroy } from 'svelte';
    import { formData, provider, resetImportStores } from '.';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { migrationFormToResources } from '$lib/stores/migration';
    import { started } from '../stores';
    import { showMigrationBox } from '$lib/components/migrationBox.svelte';
    import { addNotification } from '$lib/stores/notifications';

    const onExit = () => {
        resetImportStores();
    };

    const onFinish = async () => {
        try {
            const resources = migrationFormToResources($formData, $provider.provider);

            switch ($provider.provider) {
                case 'appwrite': {
                    await sdk.forProject.migrations.createAppwriteMigration(
                        resources,
                        $provider.endpoint,
                        $provider.projectID,
                        $provider.apiKey
                    );

                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'supabase': {
                    await sdk.forProject.migrations.createSupabaseMigration(
                        resources,
                        $provider.endpoint,
                        $provider.apiKey,
                        $provider.host,
                        $provider.username || 'postgres',
                        $provider.password,
                        $provider.port || 5432
                    );

                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'firebase': {
                    await sdk.forProject.migrations.createFirebaseMigration(
                        resources,
                        $provider.serviceAccount
                    );
                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'nhost': {
                    await sdk.forProject.migrations.createNHostMigration(
                        resources,
                        $provider.subdomain,
                        $provider.region,
                        $provider.adminSecret,
                        $provider.database || $provider.subdomain,
                        $provider.username || 'postgres',
                        $provider.password
                    );

                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
            }
            resetImportStores();
            wizard.hide();
            started.set(performance.now());

            showMigrationBox.set(true);
        } catch (e) {
            addNotification({
                title: 'Error',
                message: e.message,
                type: 'error'
            });
        }
    };

    onDestroy(onExit);

    const steps: WizardStepsType = new Map();
    steps.set(1, {
        label: 'Source',
        component: Step1
    });
    steps.set(2, {
        label: 'Resources',
        component: Step2
    });
</script>

<Wizard title="Create Migration" {steps} on:exit={onExit} on:finish={onFinish} />
