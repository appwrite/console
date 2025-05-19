<script lang="ts">
    import { WizardWithSteps } from '$lib/layout';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { wizard } from '$lib/stores/wizard';
    import { addCreditWizardSteps, addCreditWizardStore } from './store';
    import AddCredit from './wizard/addCredit.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import PaymentDetails from './wizard/paymentDetails.svelte';

    async function onFinish() {
        await invalidate(Dependencies.CREDIT);
    }

    async function create() {
        try {
            await sdk.forConsole.organizations.setDefaultPaymentMethod(
                $organization.$id,
                $addCreditWizardStore.paymentMethodId
            );

            await sdk.forConsole.organizations.addCredit(
                $organization.$id,
                $addCreditWizardStore.coupon
            );
            addNotification({
                type: 'success',
                message: `Credit has been added to ${$organization.name}`
            });
            await invalidate(Dependencies.CREDIT);
            await invalidate(Dependencies.ORGANIZATION);
            trackEvent(Submit.CreditRedeem, {
                coupon: $addCreditWizardStore.coupon
            });

            wizard.hide();
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.CreditRedeem);
        }
    }
    onDestroy(() => {
        $addCreditWizardStore = {
            coupon: null,
            paymentMethodId: null
        };
    });

    $addCreditWizardSteps.set(1, {
        label: 'Credits',
        component: AddCredit
    });
    $addCreditWizardSteps.set(2, {
        label: 'Payment',
        component: PaymentDetails
    });
</script>

<WizardWithSteps
    title="Add credits"
    steps={$addCreditWizardSteps}
    finalAction="Add credits"
    on:finish={create}
    on:exit={onFinish} />
