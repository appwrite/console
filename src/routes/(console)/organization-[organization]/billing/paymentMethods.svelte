<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        CardGrid,
        CreditCardBrandImage,
        CreditCardInfo,
        DropList,
        DropListItem,
        Heading
    } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import { paymentMethods } from '$lib/stores/billing';
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import DeleteOrgPayment from './deleteOrgPayment.svelte';
    import ReplaceCard from './replaceCard.svelte';
    import EditPaymentModal from '$routes/(console)/account/payments/editPaymentModal.svelte';
    import { tooltip } from '$lib/actions/tooltip';
    import PaymentModal from '$lib/components/billing/paymentModal.svelte';
    import { user } from '$lib/stores/user';

    let showDropdown = false;
    let showDropdownBackup = false;

    let showPayment = false;
    let showEdit = false;
    let showDelete = false;
    let showReplace = false;
    let isSelectedBackup = false;
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
            trackEvent(Submit.OrganizationPaymentUpdate);
            invalidate(Dependencies.ORGANIZATION);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationPaymentUpdate);
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
            trackError(error, Submit.OrganizationPaymentUpdate);
        }
    }

    $: if ($organization?.backupPaymentMethodId) {
        sdk.forConsole.billing
            .getOrganizationPaymentMethod($organization.$id, $organization.backupPaymentMethodId)
            .then((res) => (backupPaymentMethod = res));
    }

    $: if ($organization?.paymentMethodId) {
        sdk.forConsole.billing
            .getOrganizationPaymentMethod($organization.$id, $organization.paymentMethodId)
            .then((res) => (defaultPaymentMethod = res));
    }

    $: if (!showReplace) {
        isSelectedBackup = false;
    }
</script>

<CardGrid>
    <Heading tag="h2" size="6" id="paymentMethod">Payment methods</Heading>

    <p class="text">View or update your organization payment methods here.</p>
    <svelte:fragment slot="aside">
        <div class="u-flex u-flex-vertical u-gap-8">
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
                            {#if defaultPaymentMethod.userId === $user.$id}
                                <DropListItem
                                    icon="pencil"
                                    on:click={() => {
                                        isSelectedBackup = false;
                                        showEdit = true;
                                        showDropdown = false;
                                    }}>
                                    Edit
                                </DropListItem>
                            {/if}
                            <DropListItem
                                icon="switch-horizontal"
                                on:click={() => {
                                    isSelectedBackup = false;
                                    showReplace = true;
                                    showDropdown = false;
                                }}>
                                Replace
                            </DropListItem>
                            <DropListItem
                                icon="trash"
                                on:click={() => {
                                    isSelectedBackup = false;
                                    showDelete = true;
                                    showDropdown = false;
                                }}>
                                Remove
                            </DropListItem>
                        </svelte:fragment>
                    </DropList>
                </CreditCardInfo>
            {:else}
                {@const filteredPaymentMethods = $paymentMethods.paymentMethods.filter(
                    (o) => !!o.last4 && o.$id !== $organization?.backupPaymentMethodId
                )}
                <article class="card u-grid u-cross-center u-width-full-line dashed">
                    <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                        <div class="common-section">
                            <DropList bind:show={showDropdown} placement="bottom-start">
                                <Button
                                    secondary
                                    round
                                    on:click={() => {
                                        if (filteredPaymentMethods.length) {
                                            showDropdown = !showDropdown;
                                        } else {
                                            showPayment = true;
                                        }
                                    }}>
                                    <i class="icon-plus" />
                                </Button>
                                <svelte:fragment slot="list">
                                    {#if $paymentMethods.total}
                                        {#each filteredPaymentMethods as paymentMethod}
                                            <DropListItem
                                                on:click={() => {
                                                    showDropdown = false;
                                                    addPaymentMethod(paymentMethod?.$id);
                                                }}>
                                                <span class="u-flex u-cross-center u-gap-8">
                                                    <p class="text">
                                                        Card ending in {paymentMethod.last4}
                                                    </p>
                                                    <CreditCardBrandImage
                                                        brand={paymentMethod?.brand} />
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
        </div>
        {#if $organization?.billingPlan !== BillingPlan.FREE && $organization?.billingPlan !== BillingPlan.GITHUB_EDUCATION}
            <div class="u-flex u-flex-vertical u-gap-8">
                {#if $organization?.backupPaymentMethodId}
                    <h4 class="u-bold body-text-2">Backup</h4>
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
                                {#if backupPaymentMethod.userId === $user.$id}
                                    <DropListItem
                                        icon="pencil"
                                        on:click={() => {
                                            showEdit = true;
                                            isSelectedBackup = true;
                                            showDropdownBackup = false;
                                        }}>
                                        Edit
                                    </DropListItem>
                                {/if}
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
                                    icon="trash"
                                    on:click={() => {
                                        showDelete = true;
                                        isSelectedBackup = true;
                                        showDropdownBackup = false;
                                    }}>
                                    Delete
                                </DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </CreditCardInfo>
                {:else}
                    {@const filteredPaymentMethods = $paymentMethods.paymentMethods.filter(
                        (o) => !!o.last4 && o.$id !== $organization?.paymentMethodId
                    )}
                    <div
                        class="u-bold body-text-2 u-flex u-cross-center u-gap-8 u-padding-block-start-8">
                        <DropList bind:show={showDropdownBackup} placement="bottom-start">
                            <div class="u-flex u-gap-8 u-cross-center">
                                <Button
                                    text
                                    noMargin
                                    on:click={() => {
                                        if (filteredPaymentMethods.length) {
                                            showDropdownBackup = !showDropdownBackup;
                                        } else {
                                            isSelectedBackup = true;
                                            showPayment = true;
                                        }
                                    }}>
                                    <span class="icon-plus" />
                                    <span class="text"> Add a backup payment method </span>
                                </Button>
                                <span
                                    class="icon-info u-cursor-pointer"
                                    style="font-size: var(--icon-size-small)"
                                    use:tooltip={{
                                        content:
                                            'When your default payment method fails, a backup method will be used to pay your invoice automatically'
                                    }} />
                            </div>
                            <svelte:fragment slot="list">
                                {#if $paymentMethods.total}
                                    {#each filteredPaymentMethods as paymentMethod}
                                        <DropListItem
                                            on:click={() => {
                                                showDropdownBackup = true;
                                                addBackupPaymentMethod(paymentMethod?.$id);
                                            }}>
                                            <span class="u-flex u-cross-center u-gap-8">
                                                <p class="text">
                                                    Card ending in {paymentMethod.last4}
                                                </p>
                                                <CreditCardBrandImage
                                                    brand={paymentMethod?.brand} />
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
                {/if}
            </div>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showPayment && isCloud && hasStripePublicKey}
    <PaymentModal
        bind:show={showPayment}
        on:submit={(e) => {
            if (isSelectedBackup) {
                addBackupPaymentMethod(e.detail.$id);
            } else {
                addPaymentMethod(e.detail.$id);
            }
        }} />
{/if}
{#if showEdit && isCloud && hasStripePublicKey}
    <EditPaymentModal
        selectedPaymentMethod={isSelectedBackup ? backupPaymentMethod : defaultPaymentMethod}
        bind:show={showEdit} />
{/if}
{#if isCloud && hasStripePublicKey}
    <ReplaceCard bind:show={showReplace} isBackup={isSelectedBackup} />
{/if}
{#if showDelete && isCloud && hasStripePublicKey}
    {@const hasOtherMethod = isSelectedBackup
        ? !!$organization?.paymentMethodId
        : !!$organization?.backupPaymentMethodId}
    <DeleteOrgPayment
        bind:showDelete
        {hasOtherMethod}
        isBackup={isSelectedBackup}
        disabled={$organization?.billingPlan !== BillingPlan.FREE && !hasOtherMethod} />
{/if}
