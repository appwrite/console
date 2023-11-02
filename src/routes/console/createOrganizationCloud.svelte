<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import Step1 from './wizard/cloudOrganization/step1.svelte';
    import Step2 from './wizard/cloudOrganization/step2.svelte';
    import Step3 from './wizard/cloudOrganization/step3.svelte';
    import Step4 from './wizard/cloudOrganization/step4.svelte';
    import { createOrganization, createOrgSteps } from './wizard/cloudOrganization/store';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { wizard } from '$lib/stores/wizard';
    import { tierToPlan } from '$lib/stores/billing';

    const dispatch = createEventDispatcher();

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function create() {
        try {
            const org = await sdk.forConsole.billing.createOrganization(
                $createOrganization.id ?? ID.unique(),
                $createOrganization.name,
                $createOrganization.billingPlan,
                $createOrganization.paymentMethodId
            );

            //Add budget
            if ($createOrganization?.billingBudget) {
                await sdk.forConsole.billing.updateBudget(
                    org.$id,
                    $createOrganization.billingBudget,
                    [75]
                );
            }
            //Add collaborators
            if ($createOrganization?.collaborators?.length) {
                $createOrganization.collaborators.forEach(async (collaborator) => {
                    await sdk.forConsole.teams.createMembership(
                        org.$id,
                        ['collaborator'],
                        `${$page.url.origin}/console/organization-${org.$id}`,
                        collaborator
                    );
                });
            }

            await invalidate(Dependencies.ACCOUNT);
            dispatch('created');
            await goto(`/console/organization-${org.$id}`);
            addNotification({
                type: 'success',
                message: `${$createOrganization.name} has been created`
            });
            trackEvent(Submit.OrganizationCreate, {
                customId: !!$createOrganization.id,
                plan: tierToPlan($createOrganization.billingPlan)?.name,
                budget_cap_enabled: !!$createOrganization?.billingBudget,
                members_invited: $createOrganization?.collaborators?.length
            });
            wizard.hide();
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
            billingPlan: 'tier-1',
            paymentMethodId: null,
            collaborators: []
        };
    });

    $createOrgSteps.set(1, {
        label: 'Organization details',
        component: Step1
    });
    $createOrgSteps.set(2, {
        label: 'Payment details',
        component: Step2
    });
    $createOrgSteps.set(3, {
        label: 'Invite members',
        component: Step3
    });
    $createOrgSteps.set(4, {
        label: 'Review & confirm',
        component: Step4
    });
</script>

<Wizard
    title="Create organization"
    steps={$createOrgSteps}
    finalAction="Start trial"
    on:finish={create}
    on:exit={onFinish} />
