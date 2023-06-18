<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import { createOrganization } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@appwrite.io/console';
    import { Tier } from '$lib/system';

    const dispatch = createEventDispatcher();

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function create() {
        try {
            const org = await sdk.forConsole.teams.create(
                $createOrganization.id ?? ID.unique(),
                $createOrganization.name
            );
            await invalidate(Dependencies.ACCOUNT);
            dispatch('created');
            await goto(`/console/organization-${org.$id}`);
            addNotification({
                type: 'success',
                message: `${$createOrganization.name} has been created`
            });
            trackEvent(Submit.OrganizationCreate, {
                customId: !!$createOrganization.id
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.mesage
            });
            trackError(e, Submit.OrganizationCreate);
        }
    }
    onDestroy(() => {
        $createOrganization = {
            id: null,
            name: null,
            tier: Tier['PREMIUM']
        };
    });

    const stepsComponents: WizardStepsType = new Map();

    stepsComponents.set(1, {
        label: 'Organization details',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Payment details',
        component: Step2
    });
    stepsComponents.set(3, {
        label: 'Invite collaborators',
        component: Step2
    });
    stepsComponents.set(4, {
        label: 'Review & confirm',
        component: Step2
    });
</script>

<Wizard
    title="Create organization "
    steps={stepsComponents}
    on:finish={create}
    on:exit={onFinish} />
