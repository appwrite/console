<script lang="ts">
    import { base } from '$app/paths';
    import { LabelCard } from '$lib/components';
    import { SelectPaymentMethod } from '$lib/components/billing';
    import { BillingPlan } from '$lib/constants';
    import { Button, Form, FormList, InputTags, InputText, Label } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter,
        WizardSecondaryHeader
    } from '$lib/layout';
    import type { PaymentList } from '$lib/sdk/billing';
    import { plansInfo, tierFree, tierPro } from '$lib/stores/billing';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/i;
    $: anyOrgFree = $organizationList.teams?.find(
        (org) => (org as Organization)?.billingPlan === BillingPlan.STARTER
    );

    let methods: PaymentList;
    let billingPlan: BillingPlan = BillingPlan.STARTER;
    let paymentMethodId: string;

    onMount(async () => {
        if (anyOrgFree) {
            billingPlan = BillingPlan.PRO;
        }
    });

    async function loadPaymentMethods() {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        // initialPaymentMethodId =
        //     methods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
        // $createOrganization.paymentMethodId = initialPaymentMethodId;
    }

    $: freePlan = $plansInfo.get(BillingPlan.STARTER);
    $: proPlan = $plansInfo.get(BillingPlan.PRO);
    $: if (billingPlan === BillingPlan.PRO) {
        loadPaymentMethods();
    }
</script>

<svelte:head>
    <title>Create organization - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer>
    <WizardSecondaryHeader href={`${base}/console`}>Create organization</WizardSecondaryHeader>
    <WizardSecondaryContent>
        <Form onSubmit={() => console.log('test')}>
            <FormList>
                <InputText label="Name" placeholder="Enter name" id="name" required />
            </FormList>
            <Label class="u-margin-block-start-16">Select plan</Label>
            <p class="text">
                For more details on our plans, visit our
                <Button href="https://appwrite.io/pricing" external link>pricing page</Button>.
            </p>
            <ul
                class="u-flex u-gap-16 u-margin-block-start-8"
                style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 1rem;">
                <li class="u-flex-basis-50-percent">
                    <LabelCard
                        name="plan"
                        bind:group={billingPlan}
                        value="tier-0"
                        disabled={!!anyOrgFree}
                        tooltipShow={!!anyOrgFree}
                        tooltipText="You are limited to 1 Free organization per account.">
                        <svelte:fragment slot="custom" let:disabled>
                            <div
                                class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                                class:u-opacity-50={disabled}>
                                <h4 class="body-text-2 u-bold">
                                    {tierFree.name}
                                </h4>
                                <p class="u-color-text-gray u-small">{tierFree.description}</p>
                                <p>
                                    {formatCurrency(freePlan?.price ?? 0)}
                                </p>
                            </div>
                        </svelte:fragment>
                    </LabelCard>
                </li>

                <li class="u-flex-basis-50-percent">
                    <LabelCard name="plan" bind:group={billingPlan} value="tier-1">
                        <svelte:fragment slot="custom">
                            <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                                <h4 class="body-text-2 u-bold">
                                    {tierPro.name}
                                </h4>
                                <p class="u-color-text-gray u-small">
                                    {tierPro.description}
                                </p>
                                <p>
                                    {formatCurrency(proPlan?.price ?? 0)} per member/month + usage
                                </p>
                            </div>
                        </svelte:fragment>
                    </LabelCard>
                </li>
            </ul>
            {#if billingPlan === BillingPlan.PRO}
                <FormList class="u-margin-block-start-16">
                    <InputTags
                        label="Invite members by email"
                        tooltip="Invited members will have access to all services and payment data within your organization"
                        placeholder="Enter email address(es)"
                        validityRegex={emailRegex}
                        validityMessage="Invalid email address"
                        id="members" />
                    <SelectPaymentMethod bind:methods bind:value={paymentMethodId}
                    ></SelectPaymentMethod>
                </FormList>
                <Button text noMargin class="u-margin-block-start-16">
                    <span class="icon-plus"></span> <span class="text">Add credits</span>
                </Button>
            {/if}
        </Form>
        <svelte:fragment slot="aside">
            <div class="card">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae, incidunt!
            </div>
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button href={`${base}/console`} secondary>Cancel</Button>
        <Button on:click>Create organization</Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>
