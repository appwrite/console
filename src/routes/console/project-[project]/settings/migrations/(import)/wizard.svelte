<script lang="ts">
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
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
                    const res = await sdk.forProject.migrations.createAppwriteMigration(
                        resources,
                        $provider.endpoint,
                        $provider.projectID,
                        $provider.apiKey
                    );
                    console.log('appwrite', res);
                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'supabase': {
                    const res = await sdk.forProject.migrations.createSupabaseMigration(
                        resources,
                        $provider.endpoint,
                        $provider.apiKey,
                        $provider.host,
                        $provider.username,
                        $provider.password,
                        $provider.port
                    );
                    console.log('Supabase', res);
                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'firebase': {
                    console.log('firebase', $provider.serviceAccount);
                    if ($provider.projectId) {
                        // OAuth
                    } else if ($provider.serviceAccount) {
                        // Manual auth
                        const res = await sdk.forProject.migrations.createFirebaseMigration(
                            resources,
                            $provider.serviceAccount
                        );
                        console.log('Firebase', res);
                    }
                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'nhost': {
                    const res = await sdk.forProject.migrations.createNHostMigration(
                        resources,
                        $provider.subdomain,
                        $provider.region,
                        $provider.adminSecret,
                        $provider.database,
                        $provider.username,
                        $provider.password
                    );
                    console.log('nhost', res);
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
        label: 'Choose provider',
        component: Step1
    });
    steps.set(2, {
        label: 'Select data',
        component: Step2
    });
</script>

<Wizard title="Create Project" {steps} on:exit={onExit} on:finish={onFinish} />
