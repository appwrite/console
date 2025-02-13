<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID, Region } from '@appwrite.io/console';
    import { createProject } from './wizard/store';
    import { wizard } from '$lib/stores/wizard';
    import { base } from '$app/paths';

    const teamId = $page.params.organization;

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function create() {
        try {
            // TODO: fix typing once SDK is updated
            const project = await sdk.forConsole.projects.create(
                $createProject?.id ?? ID.unique(),
                $createProject.name,
                teamId,
                $createProject.region as Region
            );
            trackEvent(Submit.ProjectCreate, {
                customId: !!$createProject?.id,
                teamId,
                region: $createProject.region
            });
            addNotification({
                type: 'success',
                message: `${$createProject.name} has been created`
            });
            await goto(`${base}/project-${project.region}-${project.$id}`);
            wizard.hide();
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.ProjectCreate);
        }
    }

    onDestroy(() => {
        $createProject = {
            id: null,
            name: null,
            region: 'fra'
        };
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Details',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Region',
        component: Step2
    });
</script>

<Wizard title="Create project" steps={stepsComponents} finalMethod={create} on:exit={onFinish} />
