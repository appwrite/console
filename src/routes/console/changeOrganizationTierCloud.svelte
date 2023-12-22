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
    import AddressDetails from './wizard/cloudOrganizationChangeTier/addressDetails.svelte';

    import {
        changeOrganizationFinalAction,
        changeOrganizationTier,
        changeTierSteps,
        isUpgrade
    } from './wizard/cloudOrganizationChangeTier/store';
    import { goto, invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { tierToPlan } from '$lib/stores/billing';
    import { user } from '$lib/stores/user';
    import { feedback } from '$lib/stores/feedback';
    import HoodieCover from './(billing-modal)/hoodieCover.svelte';

    const dispatch = createEventDispatcher();

    async function onFinish() {
        await invalidate(Dependencies.ORGANIZATION);
    }

    async function changeTier() {
        //Downgrade
        if ($changeOrganizationTier.billingPlan === BillingPlan.STARTER) {
            try {
                await sdk.forConsole.billing.updatePlan(
                    $organization.$id,
                    $changeOrganizationTier.billingPlan,
                    $changeOrganizationTier.paymentMethodId,
                    $changeOrganizationTier.billingAddressId
                );
                feedback.submitFeedback(
                    'downgrade',
                    $changeOrganizationTier.feedbackMessage,
                    $user?.name ?? '',
                    $user.email
                );

                addNotification({
                    type: 'success',
                    isHtml: true,
                    message: `
                    <b>${$organization.name}</b> has been changed to ${
                        tierToPlan($changeOrganizationTier.billingPlan).name
                    } plan.`
                });
                wizard.hide();

                trackEvent(Submit.OrganizationDowngrade, {
                    plan: tierToPlan($changeOrganizationTier.billingPlan)?.name
                });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                trackError(
                    e,
                    $isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade
                );
            }
        } else {
            try {
                const org = await sdk.forConsole.billing.updatePlan(
                    $organization.$id,
                    $changeOrganizationTier.billingPlan,
                    $changeOrganizationTier.paymentMethodId,
                    $changeOrganizationTier.billingAddressId
                );

                //Add coupon
                if ($changeOrganizationTier.couponCode) {
                    await sdk.forConsole.billing.addCredit(
                        org.$id,
                        $changeOrganizationTier.couponCode
                    );
                }

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
                            ['owner'],
                            collaborator,
                            undefined,
                            undefined,
                            `${$page.url.origin}/console/organization-${org.$id}`
                        );
                    });
                }

                //Add tax ID
                if ($changeOrganizationTier?.taxId) {
                    await sdk.forConsole.billing.updateTaxId(
                        org.$id,
                        $changeOrganizationTier.taxId
                    );
                }

                await invalidate(Dependencies.ACCOUNT);
                await invalidate(Dependencies.ORGANIZATION);

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
                        <b>${$organization.name}</b> will change to ${
                            tierToPlan($changeOrganizationTier.billingPlan).name
                        } plan at the end of the current billing cycle.`
                    });
                }
                trackEvent($isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade, {
                    plan: tierToPlan($changeOrganizationTier.billingPlan)?.name
                });
                wizard.hide();
                wizard.showCover(HoodieCover);
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                trackError(
                    e,
                    $isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade
                );
            }
        }
    }

    onDestroy(() => {
        $changeOrganizationTier = {
            billingPlan: BillingPlan.PRO,
            paymentMethodId: null,
            collaborators: [],
            billingAddressId: null,
            taxId: null,
            feedbackMessage: null
        };
    });

    $changeTierSteps.set(1, {
        label: 'Plans',
        component: ChoosePlan
    });
    $changeTierSteps.set(2, {
        label: 'Payment details',
        component: PaymentDetails
    });
    $changeTierSteps.set(3, {
        label: 'Address',
        component: AddressDetails
    });
    $changeTierSteps.set(4, {
        label: 'Members',
        component: InviteMembers
    });
    $changeTierSteps.set(5, {
        label: 'Usage',
        component: UsageExcess,
        disabled: true
    });
    $changeTierSteps.set(6, {
        label: 'Review',
        component: ConfirmDetails
    });

    $wizard.finalAction = changeTier;
</script>

<Wizard
    title="Change plan"
    steps={$changeTierSteps}
    finalAction={$changeOrganizationFinalAction}
    on:exit={onFinish} />
