<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button, FormList, InputRadio, InputText } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { Dependencies } from '$lib/constants';
    import { initializeStripe, isStripeInitialized, submitStripeCard } from '$lib/stores/stripe';
    import { onMount } from 'svelte';
    import type { PaymentList } from '$lib/sdk/billing';
    import { getCreditCardImage } from '$lib/stores/billing';
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

        selectedPaymentMethodId = isBackup
            ? $organization.backupPaymentMethodId
            : $organization.paymentMethodId;
    });

    // TODO: fix new payment method replacement
    async function handleSubmit() {
        try {
            console.log(selectedPaymentMethodId);
            if (!selectedPaymentMethodId) {
                const method = await submitStripeCard(name);
                selectedPaymentMethodId = method.$id;
            }
            console.log(selectedPaymentMethodId);
            isBackup
                ? await addBackupPaymentMethod(selectedPaymentMethodId)
                : await addPaymentMethod(selectedPaymentMethodId);

            addNotification({
                type: 'success',
                message: `Your ${isBackup ? 'backup' : 'default'} payment method has been updated`
            });
            invalidate(Dependencies.ORGANIZATION);
            trackEvent(
                isBackup
                    ? Submit.OrganizationBackupPaymentRemoved
                    : Submit.OrganizationPaymentRemoved
            );
            show = false;
        } catch (e) {
            error = e.message;
            trackError(
                e,
                isBackup
                    ? Submit.OrganizationBackupPaymentRemoved
                    : Submit.OrganizationPaymentRemoved
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

<Modal bind:show bind:error onSubmit={handleSubmit} size="big" headerDivider={false}>
    <svelte:fragment slot="header">Replace payment method</svelte:fragment>
    <p class="text">Replace the existing payment method for your organization.</p>
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
                            <span class="u-flex u-cross-center u-gap-8">
                                <span>
                                    <span class="u-capitalize">{method.brand}</span> ending in {method.last4}</span>
                                <img
                                    width="23"
                                    height="16"
                                    src={getCreditCardImage(method.brand)}
                                    alt={method.brand} />
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
                    label="Add new payment method"
                    value={null}
                    name="payment"
                    bind:group={selectedPaymentMethodId} />
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

                    <div id="payment-element">
                        <!-- Elements will create form elements here -->
                    </div>
                </FormList>
            {/if}
        </div>
    </div>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button
            secondary
            submit
            disabled={selectedPaymentMethodId ===
                (isBackup ? $organization.backupPaymentMethodId : $organization.paymentMethodId)}
            >Save</Button>
    </svelte:fragment>
</Modal>
