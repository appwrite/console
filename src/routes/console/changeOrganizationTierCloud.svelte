<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import Step1 from './wizard/cloudOrganizationChangeTier/step1.svelte';
    import Step2 from './wizard/cloudOrganizationChangeTier/step2.svelte';
    import Step3 from './wizard/cloudOrganizationChangeTier/step3.svelte';
    import Step4 from './wizard/cloudOrganizationChangeTier/step4.svelte';
    import { changeOrganizationTier } from './wizard/cloudOrganizationChangeTier/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import { organization } from '$lib/stores/organization';

    const dispatch = createEventDispatcher();

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function upgrade() {
        try {
            const org = await sdk.forConsole.billing.updatePlan(
                $organization.$id,
                $changeOrganizationTier.billingPlan,
                $changeOrganizationTier.paymentMethodId
            );

            //Add budget
            if ($changeOrganizationTier?.billingBudget) {
                await sdk.forConsole.billing.updateBudget(
                    org.$id,
                    $changeOrganizationTier.billingBudget,
                    [75]
                );
            }
            //Add collaborators
            if ($changeOrganizationTier?.collaborators?.length) {
                $changeOrganizationTier.collaborators.forEach(async (collaborator) => {
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
                isHtml: true,
                message: `
                <b>Your organization has been upgraded</b>
                Make the most of your increased resource capacity and continue building great things with Appwrite.`
            });
            trackEvent(Submit.OrganizationCreate, {
                customId: !!$changeOrganizationTier.id
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
        $changeOrganizationTier = {
            id: null,
            billingPlan: 'tier-1',
            paymentMethodId: null,
            collaborators: []
        };
    });

    const stepsComponents: WizardStepsType = new Map();

    stepsComponents.set(1, {
        label: 'Change plan',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Payment details',
        component: Step2
    });
    stepsComponents.set(3, {
        label: 'Invite collaborators',
        component: Step3
    });
    stepsComponents.set(4, {
        label: 'Review & confirm',
        component: Step4
    });
</script>

<Wizard
    title="Change plan"
    steps={stepsComponents}
    finalAction="Start trial"
    on:finish={upgrade}
    on:exit={onFinish} />
