<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { goto, invalidate } from '$app/navigation';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/step1.svelte';
    import { devKey } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { onDestroy } from 'svelte';
    import { onboarding } from '../../store';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';

    async function onFinish() {
        try {
            const { $id } = await sdk.forConsole.projects.createDevKey(
                $page.params.project,
                $devKey.name,
                $devKey.expire || undefined
            );
            if ($onboarding) {
                await invalidate(Dependencies.PROJECT);
            }
            trackEvent(Submit.DevKeyCreate);
            goto(`${base}/project-${$page.params.project}/overview/dev-keys/${$id}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DevKeyCreate);
        }
    }

    onDestroy(() => {
        devKey.reset();
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Details',
        component: Step1
    });
</script>

<Wizard title="Create a Dev key" steps={stepsComponents} on:finish={onFinish} />
