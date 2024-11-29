<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { goto, invalidate } from '$app/navigation';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import { key } from './wizard/store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { onDestroy } from 'svelte';
    import { onboarding } from '../../store';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { isStandardApiKey } from '../store';

    // TODO: check onFinish as to which key type was generated, standard or development.
    //  Based on that, call appropriate creator method and update notification.

    // TODO: also check if we should add different keys for events based on standard/dev keys.
    async function onFinish() {
        try {
            const { $id } = await sdk.forConsole.projects.createKey(
                $page.params.project,
                $key.name,
                $key.scopes,
                $key.expire || undefined
            );
            if ($onboarding) {
                await invalidate(Dependencies.PROJECT);
            }
            trackEvent(Submit.KeyCreate, {
                scopes: $key.scopes
            });
            goto(`${base}/project-${$page.params.project}/overview/keys/${$id}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyCreate);
        }
    }

    onDestroy(() => {
        key.reset();
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

<Wizard
    title="Create {$isStandardApiKey ? 'an API' : 'a Dev'} key"
    steps={stepsComponents}
    on:finish={onFinish} />
