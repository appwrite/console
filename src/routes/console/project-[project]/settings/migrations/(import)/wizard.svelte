<script lang="ts">
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { onDestroy } from 'svelte';
    import { formData, formDataToResources, provider, resetImportStores } from '.';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const onExit = () => {
        resetImportStores();
    };

    const onFinish = async () => {
        const resources = formDataToResources($formData);
        switch ($provider.provider) {
            case 'appwrite': {
                const res = await sdk.forProject.migrations.migrateAppwrite(
                    resources,
                    $provider.endpoint,
                    $provider.projectID,
                    $provider.apiKey
                );
                console.log(res);
                invalidate(Dependencies.MIGRATIONS);
                break;
            }
            case 'supabase': {
                const res = await sdk.forProject.migrations.migrateSupabase(
                    resources,
                    $provider.endpoint,
                    $provider.apiKey,
                    $provider.host,
                    $provider.username,
                    $provider.password,
                    $provider.port
                );
                console.log(res);
                invalidate(Dependencies.MIGRATIONS);
                break;
            }
            case 'firebase': {
                const res = await sdk.forProject.migrations.migrateFirebase(
                    resources,
                    $provider.serviceAccount
                );
                console.log(res);
                invalidate(Dependencies.MIGRATIONS);
                break;
            }
            case 'nhost': {
                const res = await sdk.forProject.migrations.migrateNHost(
                    resources,
                    $provider.subdomain,
                    $provider.region,
                    $provider.adminSecret,
                    $provider.database,
                    $provider.username,
                    $provider.password,
                    $provider.port
                );
                console.log(res);
                invalidate(Dependencies.MIGRATIONS);
                break;
            }
        }
        resetImportStores();
        wizard.hide();
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

<Wizard title="Create Function" {steps} on:exit={onExit} on:finish={onFinish} />
