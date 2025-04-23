<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, CreditCardBrandImage, CreditCardInfo } from '$lib/components';
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
    import PaymentModal from '$lib/components/billing/paymentModal.svelte';
    import { user } from '$lib/stores/user';
    import {
        ActionMenu,
        Card,
        Divider,
        Icon,
        Layout,
        Popover,
        Table,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconInfo,
        IconPencil,
        IconPlus,
        IconSwitchHorizontal,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';

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
    <svelte:fragment slot="title">Payment methods</svelte:fragment>
    View or update your organization payment methods here.
    <svelte:fragment slot="aside">
        {#if $organization?.paymentMethodId}
            <Table.Root
                let:root
                columns={[
                    { id: 'cc' },
                    { id: 'name' },
                    { id: 'expiry' },
                    { id: 'status' },
                    { id: 'actions', width: 40 }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="cc" {root}>Credit card</Table.Header.Cell>
                    <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                    <Table.Header.Cell column="expiry" {root}>Expiration date</Table.Header.Cell>
                    <Table.Header.Cell column="status" {root} />
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>

                <Table.Row.Base {root}>
                    <CreditCardInfo {root} paymentMethod={defaultPaymentMethod} />
                    <Table.Cell column="actions" {root}>
                        <Popover let:toggle placement="bottom-start" padding="none">
                            <Button text icon ariaLabel="more options" on:click={toggle}>
                                <Icon icon={IconDotsHorizontal} size="s" />
                            </Button>
                            <ActionMenu.Root slot="tooltip">
                                {#if defaultPaymentMethod?.userId === $user?.$id}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconPencil}
                                        on:click={() => {
                                            isSelectedBackup = false;
                                            showEdit = true;
                                        }}>
                                        Edit
                                    </ActionMenu.Item.Button>
                                {/if}
                                <ActionMenu.Item.Button
                                    leadingIcon={IconSwitchHorizontal}
                                    on:click={() => {
                                        isSelectedBackup = false;
                                        showReplace = true;
                                    }}>
                                    Replace
                                </ActionMenu.Item.Button>
                                <ActionMenu.Item.Button
                                    leadingIcon={IconTrash}
                                    on:click={() => {
                                        isSelectedBackup = false;
                                        showDelete = true;
                                    }}>
                                    Remove
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </Popover>
                    </Table.Cell>
                </Table.Row.Base>
                {#if $organization?.backupPaymentMethodId}
                    <Table.Row.Base {root}>
                        <CreditCardInfo {root} isBackup paymentMethod={backupPaymentMethod} />
                        <Table.Cell column="actions" {root}>
                            <Popover let:toggle placement="bottom-start" padding="none">
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip">
                                    {#if backupPaymentMethod?.userId === $user?.$id}
                                        <ActionMenu.Item.Button
                                            leadingIcon={IconPencil}
                                            on:click={() => {
                                                isSelectedBackup = true;
                                                showEdit = true;
                                            }}>
                                            Edit
                                        </ActionMenu.Item.Button>
                                    {/if}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconSwitchHorizontal}
                                        on:click={() => {
                                            isSelectedBackup = true;
                                            showReplace = true;
                                        }}>
                                        Replace
                                    </ActionMenu.Item.Button>
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTrash}
                                        on:click={() => {
                                            isSelectedBackup = true;
                                            showDelete = true;
                                        }}>
                                        Remove
                                    </ActionMenu.Item.Button>
                                </ActionMenu.Root>
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Base>
                {/if}
            </Table.Root>
            {#if !$organization?.backupPaymentMethodId}
                {@const filteredPaymentMethods = $paymentMethods.paymentMethods.filter(
                    (o) => !!o.last4 && o.$id !== $organization?.paymentMethodId
                )}
                <div>
                    <Popover let:toggle placement="bottom-start" padding="none">
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            <Button
                                secondary
                                on:click={(e) => {
                                    if (filteredPaymentMethods.length) {
                                        toggle(e);
                                    } else {
                                        isSelectedBackup = true;
                                        showPayment = true;
                                    }
                                }}>
                                <Icon icon={IconPlus} slot="start" size="s" />
                                Add a backup payment method
                            </Button>
                            <Tooltip>
                                <Icon icon={IconInfo} />
                                <Typography.Text slot="tooltip">
                                    If your default payment fails, your backup method will be
                                    charged automatically.
                                </Typography.Text>
                            </Tooltip>
                        </Layout.Stack>
                        <ActionMenu.Root slot="tooltip" let:toggle>
                            {#if $paymentMethods.total}
                                {#each filteredPaymentMethods as paymentMethod}
                                    <ActionMenu.Item.Button
                                        on:click={() => addBackupPaymentMethod(paymentMethod?.$id)}>
                                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                                            <CreditCardBrandImage brand={paymentMethod?.brand} />
                                            Card ending in {paymentMethod.last4}
                                        </Layout.Stack>
                                    </ActionMenu.Item.Button>
                                {/each}
                            {/if}
                            <Divider />
                            <ActionMenu.Item.Button
                                leadingIcon={IconPlus}
                                on:click={(e) => {
                                    toggle(e);
                                    showPayment = true;
                                }}>
                                Add new payment method
                            </ActionMenu.Item.Button>
                        </ActionMenu.Root>
                    </Popover>
                </div>
            {/if}
        {:else}
            {@const filteredPaymentMethods = $paymentMethods.paymentMethods.filter(
                (o) => !!o.last4 && o.$id !== $organization?.backupPaymentMethodId
            )}
            <Card.Base>
                <Layout.Stack justifyContent="center" alignItems="center" gap="m">
                    <Popover let:toggle padding="none" placement="bottom-start">
                        <Button secondary icon on:click={toggle}>
                            <Icon icon={IconPlus} size="s" />
                        </Button>
                        <ActionMenu.Root slot="tooltip" let:toggle>
                            {#if $paymentMethods.total}
                                {#each filteredPaymentMethods as paymentMethod}
                                    <ActionMenu.Item.Button
                                        on:click={() => addPaymentMethod(paymentMethod?.$id)}>
                                        <Layout.Stack direction="row" alignItems="center" gap="s">
                                            <CreditCardBrandImage brand={paymentMethod?.brand} />
                                            Card ending in {paymentMethod.last4}
                                        </Layout.Stack>
                                    </ActionMenu.Item.Button>
                                {/each}
                            {/if}
                            <Divider />
                            <ActionMenu.Item.Button
                                leadingIcon={IconPlus}
                                on:click={(e) => {
                                    toggle(e);
                                    showPayment = true;
                                }}>
                                Add new payment method
                            </ActionMenu.Item.Button>
                        </ActionMenu.Root>
                    </Popover>
                    <span>Add a payment method</span>
                </Layout.Stack>
            </Card.Base>
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
