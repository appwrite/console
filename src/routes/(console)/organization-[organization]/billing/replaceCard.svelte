<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { FakeModal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { setPaymentMethod, submitStripeCard } from '$lib/stores/stripe';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { PaymentBoxes } from '$lib/components/billing';
    import type { PaymentMethod as StripePaymentMethod } from '@stripe/stripe-js';
    import type { Models } from '@appwrite.io/console';

    let {
        show = $bindable(false),
        isBackup = false,
        methods,
        organization
    }: {
        show?: boolean;
        isBackup?: boolean;
        methods: Models.PaymentMethodList;
        organization: Models.Organization;
    } = $props();

    let name: string | null = $state(null);
    let error: string | null = $state(null);
    let showState: boolean = $state(false);
    let countryState: string | null = $state(null);
    let paymentMethod: StripePaymentMethod | null = $state(null);
    let selectedPaymentMethodId: string | null = $state(null);

    const filteredMethods = $derived(methods?.paymentMethods.filter((method) => !!method?.last4));
    const submitEvent = $derived(
        isBackup ? Submit.OrganizationBackupPaymentUpdate : Submit.OrganizationPaymentUpdate
    );

    onMount(async () => {
        if (!organization.paymentMethodId && !organization.backupPaymentMethodId) {
            selectedPaymentMethodId = methods?.total ? methods.paymentMethods[0].$id : null;
        } else {
            selectedPaymentMethodId = isBackup
                ? organization.backupPaymentMethodId
                : organization.paymentMethodId;
            // If the selected payment method does not belong to the current user, select the first one.
            if (
                methods?.total &&
                !methods.paymentMethods.some((method) => method.$id === selectedPaymentMethodId)
            ) {
                selectedPaymentMethodId = methods.paymentMethods[0].$id;
            }
        }
    });

    async function handleSubmit() {
        try {
            if (selectedPaymentMethodId === '$new') {
                if (showState && !countryState) {
                    throw Error('Please select a state');
                }
                let method: Models.PaymentMethod;
                if (showState) {
                    method = await setPaymentMethod(paymentMethod.id, name, countryState);
                } else {
                    const card = await submitStripeCard(name, organization.$id);
                    if (card && Object.hasOwn(card, 'id')) {
                        if ((card as StripePaymentMethod).card?.country === 'US') {
                            paymentMethod = card as StripePaymentMethod;
                            showState = true;
                            return;
                        }
                    } else if (card && Object.hasOwn(card, '$id')) {
                        method = card as Models.PaymentMethod;
                    }
                }
                selectedPaymentMethodId = method.$id;
            }
            isBackup
                ? await addBackupPaymentMethod(selectedPaymentMethodId)
                : await addPaymentMethod(selectedPaymentMethodId);

            await invalidate(Dependencies.PAYMENT_METHODS);

            addNotification({
                type: 'success',
                message: `Your ${isBackup ? 'backup' : 'default'} payment method has been updated`
            });
            trackEvent(submitEvent);
            show = false;
        } catch (err) {
            error = err.message;
            trackError(err, submitEvent);
        }
    }

    async function addPaymentMethod(paymentMethodId: string) {
        try {
            await sdk.forConsole.organizations.setDefaultPaymentMethod({
                organizationId: organization.$id,
                paymentMethodId
            });
        } catch (err) {
            error = err.message;
        }
    }

    async function addBackupPaymentMethod(paymentMethodId: string) {
        try {
            await sdk.forConsole.organizations.setBackupPaymentMethod({
                organizationId: organization.$id,
                paymentMethodId
            });
        } catch (err) {
            error = err.message;
        }
    }
</script>

<FakeModal bind:show bind:error onSubmit={handleSubmit} size="big" title="Replace payment method">
    <p class="text">Replace the existing payment method for your organization.</p>

    <PaymentBoxes
        bind:name
        bind:showState
        bind:paymentMethod
        methods={filteredMethods}
        bind:state={countryState}
        bind:group={selectedPaymentMethodId}
        defaultMethod={organization?.paymentMethodId}
        backupMethod={organization?.backupPaymentMethodId}
        disabledCondition={isBackup
            ? organization.paymentMethodId
            : organization.backupPaymentMethodId} />
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button
            secondary
            submit
            disabled={selectedPaymentMethodId ===
                (isBackup ? organization.backupPaymentMethodId : organization.paymentMethodId)}>
            Save
        </Button>
    </svelte:fragment>
</FakeModal>
