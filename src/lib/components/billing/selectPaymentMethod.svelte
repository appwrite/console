<script lang="ts">
    import { Button, InputText } from '$lib/elements/forms';
    import type { PaymentList, PaymentMethodData } from '$lib/sdk/billing';
    import { hasStripePublicKey, isCloud } from '$lib/system';
    import { onMount } from 'svelte';
    import PaymentModal from './paymentModal.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { Alert, Icon, Layout, Selector, Card, Typography } from '@appwrite.io/pink-svelte';
    import { IconExclamationCircle, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let methods: PaymentList;
    export let value: string;
    export let taxId = '';

    let showTaxId = false;
    let showPaymentModal = false;

    async function cardSaved(event: CustomEvent<PaymentMethodData>) {
        value = event.detail.$id;
        invalidate(Dependencies.UPGRADE_PLAN);
    }

    onMount(() => {
        if (methods?.total && methods.paymentMethods.some((method) => !!method?.last4)) {
            value = methods.paymentMethods[0].$id;
        }
    });

    $: filteredMethods = methods?.paymentMethods?.filter((method) => !!method?.last4);
    $: selectedPaymentMethod = methods?.paymentMethods?.find((method) => method.$id === value);
</script>

<Layout.Stack gap="s">
    {#if filteredMethods?.length}
        {#if selectedPaymentMethod?.country?.toLowerCase() === 'in'}
            <Alert.Inline status="warning">
                <svelte:fragment slot="title">Indian credit or debit card-holders</svelte:fragment>
                To comply with RBI regulations in India, Appwrite will ask for verification to charge
                up to $150 USD on your payment method. We will never charge more than the cost of your
                plan and the resources you use, or your budget cap limit. For higher usage limits, please
                contact us.
            </Alert.Inline>
        {/if}
        <InputSelect
            id="method"
            required
            label="Payment method"
            placeholder="Select payment method"
            bind:value
            options={filteredMethods.map((method) => {
                return {
                    value: method.$id,
                    label: `${capitalize(method.brand)} ending in ${method.last4}`,
                    data: [method.brand]
                };
            })} />
        <div>
            <Button on:click={() => (showPaymentModal = true)} compact size="s">
                <Icon icon={IconPlus} slot="start" size="s" />
                Add payment method
            </Button>
        </div>
    {:else}
        <Card.Base variant="secondary" radius="s" padding="xs">
            <Layout.Stack direction="row">
                <Layout.Stack direction="row" gap="xxs" alignItems="center">
                    <Icon
                        icon={IconExclamationCircle}
                        size="m"
                        color="--fgcolor-neutral-tertiary" />
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary"
                        >No saved payment methods</Typography.Text>
                </Layout.Stack>
                <Button secondary on:click={() => (showPaymentModal = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add
                </Button>
            </Layout.Stack>
        </Card.Base>
    {/if}
</Layout.Stack>

{#if showPaymentModal && isCloud && hasStripePublicKey}
    <PaymentModal bind:show={showPaymentModal} on:submit={cardSaved}>
        <svelte:fragment slot="end">
            <Selector.Checkbox
                id="taxIdCheck"
                label="I'm purchasing as a business"
                bind:checked={showTaxId} />
            {#if showTaxId}
                <InputText
                    id="taxId"
                    label="Tax ID"
                    autofocus
                    placeholder="Tax ID"
                    bind:value={taxId} />
            {/if}
        </svelte:fragment>
    </PaymentModal>
{/if}
