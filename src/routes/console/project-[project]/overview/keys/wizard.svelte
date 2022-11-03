<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { beforeNavigate, goto } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import { key } from './wizard/store';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';

    async function onFinish() {
        try {
            const { $id } = await sdkForConsole.projects.createKey(
                $page.params.project,
                $key.name,
                $key.scopes,
                $key.expire ?? undefined
            );
            key.reset();
            goto(`/console/project-${$page.params.project}/overview/keys/${$id}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    beforeNavigate(() => {
        wizard.hide();
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Details',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Scopes',
        component: Step2
    });
</script>

<Wizard title="Create an API Key" steps={stepsComponents} on:finish={onFinish} on:exit={onFinish} />
