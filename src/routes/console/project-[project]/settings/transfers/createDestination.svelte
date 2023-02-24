<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { createDestination } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@aw-labs/appwrite-console';
    import Step1 from './wizard/createDestination/step1.svelte';
    import Step2 from './wizard/createDestination/step2.svelte';
    import Step3 from './wizard/createDestination/step3.svelte';
    import Step4 from './wizard/createDestination/step4.svelte';

    const projectId = $page.params.project;

    async function onFinish() {
        await invalidate(Dependencies.DESTINATION);
    }
    async function create() {
        try {
            let response = null;

            switch ($createDestination.type) {
                case 'appwrite':
                    response = await sdkForProject.transfers.createAppwriteDestination(
                        $createDestination.data['project'],
                        $createDestination.data['endpoint'],
                        $createDestination.data['key'],
                        $createDestination.id ?? ID.unique(),
                        $createDestination.name
                    );
            }

            await invalidate(Dependencies.DESTINATION);
            goto(
                `${base}/console/project-${projectId}/settings/transfers/destinations/destination-${response.$id}`
            );
            addNotification({
                message: `${response.$id} has been created`,
                type: 'success'
            });
            trackEvent(Submit.DestinationCreate, {
                customId: !!response.$id
            });
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DestinationCreate);
        }
    }

    onDestroy(() => {
        $createDestination = {
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

<Wizard title="Create Destination" steps={stepsComponents} on:finish={create} on:exit={onFinish} />
