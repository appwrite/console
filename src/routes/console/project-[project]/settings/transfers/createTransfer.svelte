<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import Step1 from './wizard/createTransfer/step1.svelte';
    import { createTransfer } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@aw-labs/appwrite-console';
    import Step2 from './wizard/createTransfer/step2.svelte';
    import Step3 from './wizard/createTransfer/step3.svelte';
    import Step4 from './wizard/createTransfer/step4.svelte';
    import Step5 from './wizard/createTransfer/step5.svelte';

    const projectId = $page.params.project;

    async function onFinish() {
        await invalidate(Dependencies.TRANSFER);
    }
    async function create() {
        try {
            const response = await sdkForProject.transfers.create(
                $createTransfer.id ?? ID.unique(),
                $createTransfer.source,
                $createTransfer.destination,
                $createTransfer.resources
            );
            await invalidate(Dependencies.TRANSFER);
            goto(
                `${base}/console/project-${projectId}/settings/transfers/transfer-${response.$id}`
            );
            addNotification({
                message: `${response.$id} has been created`,
                type: 'success'
            });
            trackEvent(Submit.TransferCreate, {
                customId: !!response.$id
            });
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TransferCreate);
        }
    }

    onDestroy(() => {
        $createTransfer = {
            id: null,
            source: null,
            destination: null,
            resources: []
        };
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Select Source',
        component: Step1,
        footer: false
    });
    stepsComponents.set(2, {
        label: 'Select Destination',
        component: Step2,
        footer: false
    });
    stepsComponents.set(3, {
        label: 'Select Resources',
        component: Step3
    });
    stepsComponents.set(4, {
        label: 'Validation',
        component: Step4
    });
    stepsComponents.set(5, {
        label: 'Begin Transfer',
        component: Step5
    });
</script>

<Wizard title="Create Transfer" steps={stepsComponents} on:finish={create} on:exit={onFinish} />
