<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { createSource } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@aw-labs/appwrite-console';
    import Step1 from './wizard/createSource/step1.svelte';
    import Step2 from './wizard/createSource/step2.svelte';
    import Step3 from './wizard/createSource/step3.svelte';
    import Step4 from './wizard/createSource/step4.svelte';

    const projectId = $page.params.project;

    async function onFinish() {
        await invalidate(Dependencies.SOURCE);
    }

    async function create() {
        try {
            let response;
            switch ($createSource.type) {
                case 'appwrite':
                    response = await sdkForProject.transfers.createAppwriteSource(
                        $createSource.data['projectId'],
                        $createSource.data['endpoint'],
                        $createSource.data['key'],
                        $createSource.id ?? ID.unique(),
                        $createSource.name
                    );
                    break;
                case 'supabase':
                    response = await sdkForProject.transfers.createSupabaseSource(
                        $createSource.data['host'],
                        $createSource.data['password'],
                        $createSource.id ?? ID.unique(),
                        $createSource.name,
                        $createSource.data['database'],
                        $createSource.data['username'],
                        $createSource.data['port']
                    );
                    break;
                case 'nhost':
                    response = await sdkForProject.transfers.createNhostSource(
                        $createSource.data['host'],
                        $createSource.data['password'],
                        $createSource.id ?? ID.unique(),
                        $createSource.name,
                        $createSource.data['database'],
                        $createSource.data['username'],
                        $createSource.data['port']
                    );
                    break;
                case 'firebase':
                    response = await sdkForProject.transfers.createFirebaseSource(
                        $createSource.data['serviceAccount'],
                        $createSource.id ?? ID.unique(),
                        $createSource.name
                    );
                    break;
            }
            await invalidate(Dependencies.SOURCE);
            goto(
                `${base}/console/project-${projectId}/settings/transfers/sources/source-${response.$id}`
            );
            addNotification({
                message: `${response.$id} has been created`,
                type: 'success'
            });
            trackEvent(Submit.SourceCreate, {
                customId: !!response.$id
            });
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.SourceCreate);
        }
    }

    onDestroy(() => {
        $createSource = {
            id: null,
            type: null,
            name: null,
            data: {}
        };
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Select Provider',
        component: Step1,
        footer: false
    });
    stepsComponents.set(2, {
        label: 'Provide Credentials',
        component: Step2
    });
    stepsComponents.set(3, {
        label: 'Validation',
        component: Step3
    });
    stepsComponents.set(4, {
        label: 'Summary',
        component: Step4
    });
</script>

<Wizard title="Create Transfer" steps={stepsComponents} on:finish={create} on:exit={onFinish} />
