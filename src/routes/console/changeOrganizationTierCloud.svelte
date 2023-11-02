<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import Step1 from './wizard/cloudOrganizationChangeTier/step1.svelte';
    import Step2 from './wizard/cloudOrganizationChangeTier/step2.svelte';
    import Step3 from './wizard/cloudOrganizationChangeTier/step3.svelte';
    import Step4 from './wizard/cloudOrganizationChangeTier/step4.svelte';
    import Step5 from './wizard/cloudOrganizationChangeTier/step5.svelte';
    import {
        changeOrganizationFinalAction,
        changeOrganizationTier,
        changeTierSteps,
        isUpgrade
    } from './wizard/cloudOrganizationChangeTier/store';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { tierToPlan } from '$lib/stores/billing';

    const dispatch = createEventDispatcher();

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function changeTier() {
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
            if ($isUpgrade) {
                addNotification({
                    type: 'success',
                    isHtml: true,
                    message: `
                    <b>Your organization has been upgraded</b>
                   Make the most of your increased resource capacity and continue building great things with Appwrite.`
                });
            } else {
                addNotification({
                    type: 'success',
                    isHtml: true,
                    message: `
                    <b>${$organization.name}</b> has been changed to ${
                        tierToPlan($changeOrganizationTier.billingPlan).name
                    } plan.`
                });
            }
            trackEvent($isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade, {
                customId: !!$changeOrganizationTier.id,
                plan: tierToPlan($changeOrganizationTier.billingPlan)?.name
            });
            wizard.hide();
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.mesage
            });
            trackError(e, $isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade);
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

    $changeTierSteps.set(1, {
        label: 'Change plan',
        component: Step1
    });
    $changeTierSteps.set(2, {
        label: 'Payment details',
        component: Step2
    });
    $changeTierSteps.set(3, {
        label: 'Invite members',
        component: Step3
    });
    $changeTierSteps.set(4, {
        label: 'Review usage',
        component: Step4,
        disabled: true
    });
    $changeTierSteps.set(5, {
        label: 'Review & confirm',
        component: Step5
    });
</script>

<Wizard
    title="Change plan"
    steps={$changeTierSteps}
    finalAction={$changeOrganizationFinalAction}
    on:finish={changeTier}
    on:exit={onFinish} />
