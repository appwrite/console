<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { CreditCardBrandImage, FakeModal } from '$lib/components';
    import { Button, FormList, InputRadio, InputText } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { Dependencies } from '$lib/constants';
    import { initializeStripe, isStripeInitialized, submitStripeCard } from '$lib/stores/stripe';
    import { onMount } from 'svelte';
    import type { PaymentList } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Pill } from '$lib/elements';

    export let show = false;
    export let isBackup = false;
    let methods: PaymentList;
    let selectedPaymentMethodId: string;
    let name: string;
    let error: string;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();

        if (!$organization.paymentMethodId && !$organization.backupPaymentMethodId) {
            selectedPaymentMethodId = methods?.total ? methods.paymentMethods[0].$id : null;
        }
        selectedPaymentMethodId = isBackup
            ? $organization.backupPaymentMethodId
            : $organization.paymentMethodId;
    });

    async function handleSubmit() {
        try {
            if (!selectedPaymentMethodId) {
                const method = await submitStripeCard(name);
                selectedPaymentMethodId = method.$id;
            }
            isBackup
                ? await addBackupPaymentMethod(selectedPaymentMethodId)
                : await addPaymentMethod(selectedPaymentMethodId);

            addNotification({
                type: 'success',
                message: `Your ${isBackup ? 'backup' : 'default'} payment method has been updated`
            });
            invalidate(Dependencies.ORGANIZATION);
            trackEvent(
                isBackup ? Submit.OrganizationBackupPaymentDelete : Submit.OrganizationPaymentDelete
            );
            show = false;
        } catch (e) {
            error = e.message;
            trackError(
                e,
                isBackup ? Submit.OrganizationBackupPaymentDelete : Submit.OrganizationPaymentDelete
            );
        }
    }

    async function addPaymentMethod(paymentMethodId: string) {
        try {
            await sdk.forConsole.billing.setOrganizationPaymentMethod(
                $organization.$id,
                paymentMethodId
            );
        } catch (e) {
            error = e.message;
        }
    }

    async function addBackupPaymentMethod(paymentMethodId: string) {
        try {
            await sdk.forConsole.billing.setOrganizationPaymentMethodBackup(
                $organization.$id,
                paymentMethodId
            );
        } catch (e) {
            error = e.message;
        }
    }

    $: if (selectedPaymentMethodId === null && !$isStripeInitialized && show) {
        initializeStripe();
    }

    $: filteredMethods = methods?.paymentMethods.filter((method) => !!method?.last4);

    $: if (show) {
        isStripeInitialized.set(false);
    }

    $: if (!show) {
        selectedPaymentMethodId = null;
    }
</script>

<FakeModal
    bind:show
    bind:error
    onSubmit={handleSubmit}
    size="big"
    headerDivider={false}
    title="Replace payment method">
    <p class="text">Replace the existing payment method for your organization.</p>
    <FormList>
        <div class:boxes-wrapper={methods?.total}>
            {#if methods?.total}
                {#each filteredMethods as method}
                    <div class="box">
                        <InputRadio
                            id={`payment-method-${method.$id}`}
                            disabled={isBackup
                                ? method.$id === $organization.paymentMethodId
                                : method.$id === $organization.backupPaymentMethodId}
                            value={method.$id}
                            name="payment"
                            bind:group={selectedPaymentMethodId}>
                            <span class="u-flex u-gap-16 u-main-space-between">
                                <span
                                    class="u-flex u-cross-center u-gap-8"
                                    style="padding-inline:0.25rem">
                                    <span>
                                        <span class="u-capitalize">{method.brand}</span> ending in {method.last4}</span>
                                    <CreditCardBrandImage brand={method.brand} />
                                </span>
                                {#if method.$id === $organization.backupPaymentMethodId}
                                    <Pill>Backup</Pill>
                                {:else if method.$id === $organization.paymentMethodId}
                                    <Pill>Default</Pill>
                                {/if}
                            </span>
                        </InputRadio>
                    </div>
                {/each}
            {/if}

            <div class="box">
                {#if methods?.total}
                    <InputRadio
                        id="payment-method"
                        value={null}
                        name="payment"
                        bind:group={selectedPaymentMethodId}>
                        <span style="padding-inline:0.25rem">Add new payment method</span>
                    </InputRadio>
                {/if}
                {#if selectedPaymentMethodId === null}
                    <FormList>
                        <InputText
                            id="name"
                            label="Cardholder name"
                            placeholder="Cardholder name"
                            bind:value={name}
                            required
                            autofocus={true} />

                        <div id="payment-element" data-private>
                            <!-- Stripe will create form elements here -->
                        </div>
                    </FormList>
                {/if}
            </div>
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button
            secondary
            submit
            disabled={selectedPaymentMethodId ===
                (isBackup ? $organization.backupPaymentMethodId : $organization.paymentMethodId)}>
            Save
        </Button>
    </svelte:fragment>
</FakeModal>
