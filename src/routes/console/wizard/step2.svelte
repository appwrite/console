<script lang="ts">
    import {
        Button,
        Form,
        FormList,
        InputNumber,
        InputRadio,
        InputText
    } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createOrganization } from './store';
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import UsageRates from './usageRates.svelte';

    let methods = [];
    let name: string;
    let promo: string;
    let redeemedCodes = [];
    let budgetEnabled = false;
    let showRates = false;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        if (methods.length) {
            $createOrganization.paymentMethodId = methods[0].id;
        }
    });

    async function removeCode() {
        redeemedCodes = redeemedCodes.filter((code) => code !== promo);
        promo = '';
    }
    async function redeem() {
        redeemedCodes.push(promo);
        redeemedCodes = redeemedCodes;
        promo = '';
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Payment details</svelte:fragment>
    <svelte:fragment slot="subtitle">Add a payment method to your organization.</svelte:fragment>

    <FormList>
        <div class:boxes-wrapper={methods?.length}>
            {#if methods.length}
                {#each methods as method}
                    <InputRadio
                        id="payment-method"
                        label="Payment method"
                        value={method.id}
                        name={method.id}
                        group="payment" />
                {/each}
            {/if}

            <div class="box">
                <InputRadio
                    id="payment-method"
                    label="Add new payment method"
                    value={null}
                    name="test"
                    group={$createOrganization.paymentMethodId} />
                {#if $createOrganization.paymentMethodId === null}
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
                {/if}
            </div>
        </div>

        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Add credit</svelte:fragment>
                <svelte:fragment slot="subtitle">(optional)</svelte:fragment>
                <p class="text">
                    Appwrite credit will automatically be applied to your next invoice.
                </p>
                <Form onSubmit={redeem}>
                    <FormList>
                        <InputText
                            id="credit"
                            label="Promo code"
                            placeholder="APPWRITE123"
                            bind:value={promo}>
                            <Button secondary submit>Redeem</Button>
                        </InputText>
                    </FormList>
                </Form>
                {#if redeemedCodes?.length}
                    <div class="u-flex u-margin-block-start-8">
                        <div class="tags">
                            <ul class="tags-list">
                                {#each redeemedCodes as code}
                                    <li class="tags-item">
                                        <div class="input-tag">
                                            <span class="tag-text">{code}</span>
                                            <button
                                                type="button"
                                                class="input-tag-delete-button"
                                                aria-label={`delete ${code} tag`}
                                                on:click={() => removeCode(code)}>
                                                <span class="icon-x" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                {/if}
            </CollapsibleItem>
        </Collapsible>

        <div class="u-sep-block-start" />

        <InputChoice
            type="switchbox"
            id="budget"
            label="Enable budget cap"
            tooltip="If enabled, you will be notified by email when your project spend reaches 75% of the cap you set. Update your budget cap alerts in Organization Settings."
            bind:value={budgetEnabled}>
            <p class="text">
                Restrict your resource usage by setting a budget cap. <button
                    class="link"
                    type="button"
                    on:click={() => (showRates = true)}>
                    Learn more about usage rates</button
                >.
            </p>
        </InputChoice>
        {#if budgetEnabled}
            <InputNumber
                id="budget"
                label="Budget cap"
                placeholder="0"
                bind:value={$createOrganization.billingBudget} />
        {/if}
    </FormList>
</WizardStep>

<UsageRates bind:show={showRates} />
