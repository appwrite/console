<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { wizard } from '$lib/stores/wizard';
    import { addCreditWizardStore } from './store';
    import { createOrgSteps } from '$routes/console/wizard/cloudOrganization/store';
    import AddCredit from './wizard/addCredit.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function create() {
        try {
            console.log($addCreditWizardStore);

            await sdk.forConsole.billing.setOrganizationPaymentMethod(
                $organization.$id,
                $addCreditWizardStore.paymentId
            );

            await sdk.forConsole.billing.addCredit($organization.$id, $addCreditWizardStore.coupon);
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
                message: e.mesage
            });
            trackError(e, Submit.CreditRedeem);
        }
    }
    onDestroy(() => {
        $addCreditWizardStore = {
            coupon: null,
            paymentId: null
        };
    });

    $createOrgSteps.set(1, {
        label: 'Credits',
        component: AddCredit
    });
    $createOrgSteps.set(2, {
        label: 'Payment',
        component: AddCredit
    });
</script>

<Wizard
    title="Add credits"
    steps={$createOrgSteps}
    finalAction="Add credits"
    on:finish={create}
    on:exit={onFinish} />
