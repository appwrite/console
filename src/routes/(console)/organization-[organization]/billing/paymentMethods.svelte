<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, CreditCardBrandImage, CreditCardInfo } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Button } from '$lib/elements/forms';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import DeleteOrgPayment from './deleteOrgPayment.svelte';
    import ReplaceCard from './replaceCard.svelte';
    import EditPaymentModal from '$routes/(console)/account/payments/editPaymentModal.svelte';
    import PaymentModal from '$lib/components/billing/paymentModal.svelte';
    import UpdateStateModal from '$lib/components/billing/updateStateModal.svelte';
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
    import type { Models } from '@appwrite.io/console';
    import { currentPlan } from '$lib/stores/organization';

    let {
        organization,
        paymentMethods,
        backupMethod,
        primaryMethod
    }: {
        organization: Models.Organization;
        paymentMethods: Models.PaymentMethodList;
        backupMethod?: Models.PaymentMethod;
        primaryMethod?: Models.PaymentMethod;
    } = $props();

    let showEdit = $state(false);
    let showDelete = $state(false);
    let showPayment = $state(false);
    let showReplace = $state(false);
    let showUpdateState = $state(false);
    let isSelectedBackup = $state(false);
    let paymentMethodNeedingState: Models.PaymentMethod | null = $state(null);
    let dismissedPaymentMethodIds = $state<string[]>([]);

    const hasPaymentError = $derived.by(() => {
        return (
            primaryMethod?.lastError ||
            primaryMethod?.expired ||
            backupMethod?.lastError ||
            backupMethod?.expired
        );
    });

    async function addPaymentMethod(paymentMethodId: string) {
        try {
            await sdk.forConsole.organizations.setDefaultPaymentMethod({
                organizationId: organization.$id,
                paymentMethodId
            });
            addNotification({
                type: 'success',
                message: `A new payment method has been added to ${organization.name}`
            });
            trackEvent(Submit.OrganizationPaymentUpdate);
            await invalidate(Dependencies.PAYMENT_METHODS);
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
            await sdk.forConsole.organizations.setBackupPaymentMethod({
                organizationId: organization.$id,
                paymentMethodId
            });
            addNotification({
                type: 'success',
                message: `A new payment method has been added to ${organization.name}`
            });
            await invalidate(Dependencies.PAYMENT_METHODS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationPaymentUpdate);
        }
    }

    $effect(() => {
        if (!showReplace) {
            isSelectedBackup = false;
        }
    });

    $effect(() => {
        if (paymentMethods?.paymentMethods && !showUpdateState && !paymentMethodNeedingState) {
            const usMethodWithoutState = paymentMethods.paymentMethods.find(
                (method: Models.PaymentMethod) =>
                    method?.country?.toLowerCase() === 'us' &&
                    (!method.state || method.state.trim() === '') &&
                    !!method.last4 &&
                    !dismissedPaymentMethodIds.includes(method.$id)
            );

            if (usMethodWithoutState) {
                paymentMethodNeedingState = usMethodWithoutState;
                showUpdateState = true;
            }
        }
    });

    $effect(() => {
        if (!showUpdateState && paymentMethodNeedingState) {
            dismissedPaymentMethodIds = [
                ...dismissedPaymentMethodIds,
                paymentMethodNeedingState.$id
            ];
            paymentMethodNeedingState = null;
        }
    });
</script>

<CardGrid overflow={false}>
    <svelte:fragment slot="title">Payment methods</svelte:fragment>
    View or update your organization payment methods here.
    <svelte:fragment slot="aside">
        {#if organization?.paymentMethodId}
            <Table.Root
                let:root
                columns={[
                    { id: 'cc', width: { min: 225 } },
                    { id: 'name', width: { min: 140 } },
                    { id: 'expiry', width: { min: 75 } },
                    { id: 'status', width: { min: 110 }, hide: !hasPaymentError },
                    { id: 'actions', width: 40 }
                ]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="cc" {root}>Credit card</Table.Header.Cell>
                    <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                    <Table.Header.Cell column="expiry" {root}>Expiration</Table.Header.Cell>
                    <Table.Header.Cell column="status" {root} />
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>

                <Table.Row.Base {root}>
                    <CreditCardInfo {root} paymentMethod={primaryMethod} />
                    <Table.Cell column="actions" {root}>
                        <Popover let:toggle placement="bottom-start" padding="none">
                            <Button text icon ariaLabel="more options" on:click={toggle}>
                                <Icon icon={IconDotsHorizontal} size="s" />
                            </Button>
                            <ActionMenu.Root slot="tooltip">
                                {#if primaryMethod?.userId === $user?.$id}
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
                {#if organization?.backupPaymentMethodId}
                    <Table.Row.Base {root}>
                        <CreditCardInfo {root} isBackup paymentMethod={backupMethod} />
                        <Table.Cell column="actions" {root}>
                            <Popover let:toggle placement="bottom-start" padding="none">
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip">
                                    {#if backupMethod?.userId === $user?.$id}
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
            {#if !organization?.backupPaymentMethodId}
                {@const filteredPaymentMethods = paymentMethods.paymentMethods.filter(
                    (o) => !!o.last4 && o.$id !== organization?.paymentMethodId
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
                            {#if paymentMethods.total}
                                {#each filteredPaymentMethods as paymentMethod}
                                    <ActionMenu.Item.Button
                                        on:click={() => addBackupPaymentMethod(paymentMethod?.$id)}>
                                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                                            <CreditCardBrandImage brand={paymentMethod?.brand} />
                                            Card ending in {paymentMethod.last4}
                                        </Layout.Stack>
                                    </ActionMenu.Item.Button>
                                {/each}

                                <Divider />
                            {/if}
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
            {@const filteredPaymentMethods = paymentMethods.paymentMethods.filter(
                (o) => !!o.last4 && o.$id !== organization?.backupPaymentMethodId
            )}
            <Card.Base>
                <Layout.Stack justifyContent="center" alignItems="center" gap="m">
                    <Popover let:toggle padding="none" placement="bottom-start">
                        <Button secondary icon on:click={toggle}>
                            <Icon icon={IconPlus} size="s" />
                        </Button>
                        <ActionMenu.Root slot="tooltip" let:toggle>
                            {#if paymentMethods.total}
                                {#each filteredPaymentMethods as paymentMethod}
                                    <ActionMenu.Item.Button
                                        on:click={() => addPaymentMethod(paymentMethod?.$id)}>
                                        <Layout.Stack direction="row" alignItems="center" gap="s">
                                            <CreditCardBrandImage brand={paymentMethod?.brand} />
                                            Card ending in {paymentMethod.last4}
                                        </Layout.Stack>
                                    </ActionMenu.Item.Button>
                                {/each}

                                <Divider />
                            {/if}
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
        onCardSubmit={(card) => {
            if (isSelectedBackup) {
                addBackupPaymentMethod(card.$id);
            } else {
                addPaymentMethod(card.$id);
            }
        }} />
{/if}
{#if showEdit && isCloud && hasStripePublicKey}
    <EditPaymentModal
        bind:show={showEdit}
        selectedPaymentMethod={isSelectedBackup ? backupMethod : primaryMethod} />
{/if}
{#if isCloud && hasStripePublicKey}
    <ReplaceCard
        {organization}
        methods={paymentMethods}
        bind:show={showReplace}
        isBackup={isSelectedBackup} />
{/if}
{#if showDelete && isCloud && hasStripePublicKey}
    {@const hasOtherMethod = isSelectedBackup
        ? !!organization?.paymentMethodId
        : !!organization?.backupPaymentMethodId}

    <DeleteOrgPayment
        bind:showDelete
        {hasOtherMethod}
        isBackup={isSelectedBackup}
        disabled={$currentPlan.requiresPaymentMethod && !hasOtherMethod} />
{/if}

{#if showUpdateState && paymentMethodNeedingState && isCloud && hasStripePublicKey}
    <UpdateStateModal bind:show={showUpdateState} paymentMethod={paymentMethodNeedingState} />
{/if}
