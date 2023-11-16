<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import ChoosePlan from './wizard/cloudOrganizationChangeTier/choosePlan.svelte';
    import PaymentDetails from './wizard/cloudOrganizationChangeTier/paymentDetails.svelte';
    import InviteMembers from './wizard/cloudOrganizationChangeTier/inviteMembers.svelte';
    import UsageExcess from './wizard/cloudOrganizationChangeTier/usageExcess.svelte';
    import ConfirmDetails from './wizard/cloudOrganizationChangeTier/confirmDetails.svelte';
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

            //Add tax ID
            if ($changeOrganizationTier?.taxId) {
                await sdk.forConsole.billing.updateTaxId(org.$id, $changeOrganizationTier.taxId);
            }

            await invalidate(Dependencies.ACCOUNT);
            dispatch('created');
            await goto(`/console/organization-${org.$id}`);
            if ($isUpgrade) {
                addNotification({
                    type: 'success',
                    message: 'Your organization has been upgraded'
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
            collaborators: [],
            billingAddress: {
                address: null,
                address2: null,
                city: null,
                state: null,
                postalCode: null,
                country: null
            },
            taxId: null
        };
    });

    $changeTierSteps.set(1, {
        label: 'Change plan',
        component: ChoosePlan
    });
    $changeTierSteps.set(2, {
        label: 'Payment details',
        component: PaymentDetails
    });
    $changeTierSteps.set(3, {
        label: 'Billing address',
        component: PaymentDetails
    });
    $changeTierSteps.set(4, {
        label: 'Invite members',
        component: InviteMembers
    });
    $changeTierSteps.set(5, {
        label: 'Review usage',
        component: UsageExcess,
        disabled: true
    });
    $changeTierSteps.set(6, {
        label: 'Review & confirm',
        component: ConfirmDetails
    });
</script>

<Wizard
    title="Change plan"
    steps={$changeTierSteps}
    finalAction={$changeOrganizationFinalAction}
    on:finish={changeTier}
    on:exit={onFinish} />
