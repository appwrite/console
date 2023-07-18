<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, DropList, DropListItem, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import PaymentModal from '$routes/console/account/payments/paymentModal.svelte';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import { paymentMethods } from '$lib/stores/billing';

    export let showDropdown = false;
    export let showDropdownBackup = false;

    let showPayment = false;

    async function addPaymentMethod(paymentMethodId: string) {
        try {
            await sdk.forConsole.billing.setOrganizationPaymentMethod(
                $organization.$id,
                paymentMethodId
            );
            addNotification({
                type: 'success',
                message: `A new payment method has been added to ${$organization.name}`
            });
            trackEvent(Submit.OrganizationPaymentAdded);
            invalidate(Dependencies.ORGANIZATION);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationPaymentAdded);
        }
    }

    async function addBackupPaymentMethod(paymentMethodId: string) {
        try {
            await sdk.forConsole.billing.setOrganizationPaymentMethodBackup(
                $organization.$id,
                paymentMethodId
            );
            addNotification({
                type: 'success',
                message: `A new payment method has been added to ${$organization.name}`
            });
            invalidate(Dependencies.ORGANIZATION);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationPaymentAdded);
        }
    }

    console.log($paymentMethods);
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment methods</Heading>

    <p class="text">
        View or update your organization payment methods here. A maximum of two payment methods can
        be added.
    </p>
    <svelte:fragment slot="aside">
        <h4 class="u-bold body-text-2">Default</h4>
        {#if $organization?.paymentMethodId}
            <div class="box">test</div>
        {:else}
            <article class="card u-grid u-cross-center u-width-full-line dashed">
                <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                    <div class="common-section">
                        <DropList bind:show={showDropdown} placement="bottom-end">
                            <Button secondary round on:click={() => (showDropdown = !showDropdown)}>
                                <i class="icon-plus" />
                            </Button>
                            <svelte:fragment slot="list">
                                {#if $paymentMethods.total}
                                    {#each $paymentMethods.paymentMethods.filter((o) => o.$id !== $organization.backupPaymentMethodId) as paymentMethod}
                                        <DropListItem
                                            on:click={() => addPaymentMethod(paymentMethod?.$id)}>
                                            <p class="text">
                                                Card ending in {paymentMethod.last4}
                                                <span>{paymentMethod.brand}</span>
                                            </p>
                                        </DropListItem>
                                    {/each}
                                {/if}
                                <DropListItem>Add new payment method</DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </div>
                    <div class="common-section">
                        <span class="text"> Add a payment method </span>
                    </div>
                </div>
            </article>
        {/if}
        <h4 class="u-bold body-text-2">Backup</h4>
        {#if $organization?.backupPaymentMethodId}
            test
        {:else}
            <article class="card u-grid u-cross-center u-width-full-line dashed">
                <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                    <div class="common-section">
                        <DropList bind:show={showDropdownBackup} placement="bottom-end">
                            <Button
                                secondary
                                round
                                on:click={() => (showDropdownBackup = !showDropdownBackup)}>
                                <i class="icon-plus" />
                            </Button>
                            <svelte:fragment slot="list">
                                {#if $paymentMethods.total}
                                    {#each $paymentMethods.paymentMethods.filter((o) => o.$id !== $organization?.paymentMethodId) as paymentMethod}
                                        <DropListItem
                                            on:click={() =>
                                                addBackupPaymentMethod(paymentMethod?.$id)}>
                                            <p class="text">
                                                Card ending in {paymentMethod.last4}
                                                <span>{paymentMethod.brand}</span>
                                            </p>
                                        </DropListItem>
                                    {/each}
                                {/if}
                                <DropListItem>Add new payment method</DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </div>
                    <div class="common-section">
                        <span class="text"> Add a backup payment method </span>
                    </div>
                </div>
            </article>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showPayment && isCloud && hasStripePublicKey}
    <PaymentModal bind:show={showPayment} />
{/if}
