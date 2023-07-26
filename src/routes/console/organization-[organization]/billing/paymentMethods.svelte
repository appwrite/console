<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, CreditCardInfo, DropList, DropListItem, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import PaymentModal from '$routes/console/account/payments/paymentModal.svelte';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import { getCreditCardImage, paymentMethods } from '$lib/stores/billing';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import DeleteOrgPayment from './deleteOrgPayment.svelte';
    import ReplaceCard from './replaceCard.svelte';

    let showDropdown = false;
    let showDropdownBackup = false;

    let showPayment = false;
    let showDelete = false;
    let showReplace = false;
    let isSelectedBackup = false;
    let selectedPaymentMethod: string;
    let defaultPaymentMethod: PaymentMethodData;
    let backupPaymentMethod: PaymentMethodData;

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

    $: if ($organization.backupPaymentMethodId) {
        sdk.forConsole.billing
            .getPaymentMethod($organization.backupPaymentMethodId)
            .then((res) => (backupPaymentMethod = res));
    }

    $: if ($organization.paymentMethodId) {
        sdk.forConsole.billing
            .getPaymentMethod($organization.paymentMethodId)
            .then((res) => (defaultPaymentMethod = res));
    }
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
            <CreditCardInfo isBox paymentMethod={defaultPaymentMethod}>
                <DropList bind:show={showDropdown} placement="bottom-start" noArrow>
                    <Button
                        round
                        text
                        ariaLabel="More options"
                        on:click={() => {
                            showDropdown = !showDropdown;
                        }}>
                        <span class="icon-dots-horizontal" aria-hidden="true" />
                    </Button>
                    <svelte:fragment slot="list">
                        <DropListItem
                            icon="pencil"
                            on:click={() => {
                                console.log('test');
                            }}>
                            Edit
                        </DropListItem>
                        <DropListItem
                            icon="switch-horizontal"
                            on:click={() => {
                                showReplace = true;
                                showDropdown = false;
                            }}>
                            Replace
                        </DropListItem>
                        <DropListItem
                            disabled={!$organization?.backupPaymentMethodId}
                            icon="trash"
                            on:click={() => {
                                showDelete = true;
                                showDropdown = false;
                                selectedPaymentMethod = $organization.paymentMethodId;
                            }}>
                            Delete
                        </DropListItem>
                    </svelte:fragment>
                </DropList>
            </CreditCardInfo>
        {:else}
            <article class="card u-grid u-cross-center u-width-full-line dashed">
                <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                    <div class="common-section">
                        <DropList bind:show={showDropdown} placement="bottom-start">
                            <Button secondary round on:click={() => (showDropdown = !showDropdown)}>
                                <i class="icon-plus" />
                            </Button>
                            <svelte:fragment slot="list">
                                {#if $paymentMethods.total}
                                    {#each $paymentMethods.paymentMethods.filter((o) => !!o.last4 && o.$id !== $organization.backupPaymentMethodId) as paymentMethod}
                                        <DropListItem
                                            on:click={() => {
                                                showDropdown = false;
                                                addPaymentMethod(paymentMethod?.$id);
                                            }}>
                                            <span class="u-flex u-cross-center u-gap-8">
                                                <p class="text">
                                                    Card ending in {paymentMethod.last4}
                                                </p>
                                                <img
                                                    width="23"
                                                    height="16"
                                                    src={getCreditCardImage(paymentMethod?.brand)}
                                                    alt={paymentMethod?.brand} />
                                            </span>
                                        </DropListItem>
                                    {/each}
                                {/if}
                                <DropListItem on:click={() => (showPayment = true)}>
                                    Add new payment method
                                </DropListItem>
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
            <CreditCardInfo isBox paymentMethod={backupPaymentMethod}>
                <DropList bind:show={showDropdownBackup} placement="bottom-start" noArrow>
                    <Button
                        round
                        text
                        ariaLabel="More options"
                        on:click={() => {
                            showDropdownBackup = !showDropdownBackup;
                        }}>
                        <span class="icon-dots-horizontal" aria-hidden="true" />
                    </Button>
                    <svelte:fragment slot="list">
                        <DropListItem
                            icon="pencil"
                            on:click={() => {
                                console.log('test');
                            }}>
                            Edit
                        </DropListItem>
                        <DropListItem
                            icon="switch-horizontal"
                            on:click={() => {
                                showReplace = true;
                                isSelectedBackup = true;
                                showDropdownBackup = false;
                            }}>
                            Replace
                        </DropListItem>
                        <DropListItem
                            disabled={!$organization?.paymentMethodId}
                            icon="trash"
                            on:click={() => {
                                showDelete = true;
                                isSelectedBackup = true;
                                showDropdownBackup = false;
                                selectedPaymentMethod = $organization.backupPaymentMethodId;
                            }}>
                            Delete
                        </DropListItem>
                    </svelte:fragment>
                </DropList>
            </CreditCardInfo>
        {:else}
            <article class="card u-grid u-cross-center u-width-full-line dashed">
                <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                    <div class="common-section">
                        <DropList bind:show={showDropdownBackup} placement="bottom-start">
                            <Button
                                secondary
                                round
                                on:click={() => (showDropdownBackup = !showDropdownBackup)}>
                                <i class="icon-plus" />
                            </Button>
                            <svelte:fragment slot="list">
                                {#if $paymentMethods.total}
                                    {#each $paymentMethods.paymentMethods.filter((o) => !!o.last4 && o.$id !== $organization?.paymentMethodId) as paymentMethod}
                                        <DropListItem
                                            on:click={() => {
                                                showDropdownBackup = true;
                                                addBackupPaymentMethod(paymentMethod?.$id);
                                            }}>
                                            <span class="u-flex u-cross-center u-gap-8">
                                                <p class="text">
                                                    Card ending in {paymentMethod.last4}
                                                </p>
                                                <img
                                                    width="23"
                                                    height="16"
                                                    src={getCreditCardImage(paymentMethod?.brand)}
                                                    alt={paymentMethod?.brand} />
                                            </span>
                                        </DropListItem>
                                    {/each}
                                {/if}
                                <DropListItem on:click={() => (showPayment = true)}
                                    >Add new payment method</DropListItem>
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
{#if showReplace && isCloud && hasStripePublicKey}
    <ReplaceCard bind:show={showReplace} isBackup={isSelectedBackup} />
{/if}
{#if showDelete && isCloud && hasStripePublicKey}
    <DeleteOrgPayment bind:showDelete isBackup={isSelectedBackup} />
{/if}
