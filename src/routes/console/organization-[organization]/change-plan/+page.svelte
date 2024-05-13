<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { LabelCard } from '$lib/components';
    import {
        EstimatedTotalBox,
        PlanComparisonBox,
        SelectPaymentMethod
    } from '$lib/components/billing';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputTags, Label } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter,
        WizardSecondaryHeader
    } from '$lib/layout';
    import type { Coupon, PaymentList } from '$lib/sdk/billing';
    import { plansInfo, tierFree, tierPro, tierToPlan, type Tier } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organization, organizationList, type Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    $: anyOrgFree = $organizationList.teams?.find(
        (org) => (org as Organization)?.billingPlan === BillingPlan.STARTER
    );
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/i;
    let previousPage: string = `${base}/console`;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    let formComponent: Form;
    let isSubmitting = writable(false);

    let methods: PaymentList;
    let billingPlan: Tier = $organization.billingPlan;
    let paymentMethodId: string;
    let collaborators: string[] = [];
    let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };
    let taxId: string;

    let billingBudget: number;
    let showCreditModal = false;

    onMount(async () => {
        if ($page.url.searchParams.has('coupon')) {
            const coupon = $page.url.searchParams.get('coupon');
            try {
                const response = await sdk.forConsole.billing.getCoupon(coupon);
                couponData = response;
            } catch (e) {
                couponData = {
                    code: null,
                    status: null,
                    credits: null
                };
            }
        }
        if ($page.url.searchParams.has('name')) {
            name = $page.url.searchParams.get('name');
        }
        if ($page.url.searchParams.has('plan')) {
            const plan = $page.url.searchParams.get('plan');
            if (plan && plan in BillingPlan) {
                billingPlan = plan as BillingPlan;
            }
        }
        billingPlan = $organization.billingPlan;
    });

    async function loadPaymentMethods() {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        paymentMethodId = methods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
    }

    const feedbackDowngradeOptions = [
        {
            value: 'availableFeatures',
            label: "The available features don't meet my needs"
        },
        {
            value: 'traction',
            label: "My project isn't getting traction"
        },
        {
            value: 'bugs',
            label: 'I experienced bugs or unexpected outages while using the console'
        },
        {
            value: 'starter',
            label: 'The Starter plan is enough for my projects'
        },
        {
            value: 'budget',
            label: "I don't have the budget"
        },
        {
            value: 'tryOut',
            label: 'I just wanted to try it out'
        },
        {
            value: 'alternative',
            label: 'I found an alternative/competitor to meet my needs'
        },
        {
            value: 'other',
            label: 'Other'
        }
    ];

    let feedbackDowngradeReason: string;
    let feedbackMessage: string;

    async function update() {
        //Downgrade
        if (billingPlan === BillingPlan.STARTER) {
            try {
                await sdk.forConsole.billing.updatePlan(
                    $organization.$id,
                    billingPlan,
                    paymentMethodId,
                    null
                );

                await fetch(`${VARS.GROWTH_ENDPOINT}/feedback/billing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: tierToPlan($organization.billingPlan).name,
                        to: tierToPlan(billingPlan).name,
                        email: $user.email,
                        reason: feedbackDowngradeOptions.find(
                            (option) => option.value === feedbackDowngradeReason
                        )?.label,
                        orgId: $organization.$id,
                        userId: $user.$id,
                        message: feedbackMessage ?? ''
                    })
                });

                addNotification({
                    type: 'success',
                    isHtml: true,
                    message: `
                    <b>${$organization.name}</b> has been changed to ${
                        tierToPlan(billingPlan).name
                    } plan.`
                });

                trackEvent(Submit.OrganizationDowngrade, {
                    plan: tierToPlan(billingPlan)?.name
                });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                trackError(
                    e,
                    isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade
                );
            }
        } else {
            try {
                const org = await sdk.forConsole.billing.updatePlan(
                    $organization.$id,
                    billingPlan,
                    paymentMethodId,
                    null
                );

                //Add coupon
                if (couponData?.code) {
                    await sdk.forConsole.billing.addCredit(org.$id, couponData.code);
                    trackEvent(Submit.CreditRedeem);
                }

                //Add budget
                if (billingBudget) {
                    await sdk.forConsole.billing.updateBudget(org.$id, billingBudget, [75]);
                }

                //Add collaborators
                if (collaborators?.length) {
                    collaborators.forEach(async (collaborator) => {
                        await sdk.forConsole.teams.createMembership(
                            org.$id,
                            ['owner'],
                            collaborator,
                            undefined,
                            undefined,
                            `${$page.url.origin}/console/organization-${org.$id}`
                        );
                    });
                }

                //Add tax ID
                if (taxId) {
                    await sdk.forConsole.billing.updateTaxId(org.$id, taxId);
                }

                await invalidate(Dependencies.ACCOUNT);
                await invalidate(Dependencies.ORGANIZATION);

                await goto(`/console/organization-${org.$id}`);
                if (isUpgrade) {
                    addNotification({
                        type: 'success',
                        message: 'Your organization has been upgraded'
                    });
                } else {
                    addNotification({
                        type: 'success',
                        isHtml: true,
                        message: `
                        <b>${$organization.name}</b> will change to ${
                            tierToPlan(billingPlan).name
                        } plan at the end of the current billing cycle.`
                    });
                }
                trackEvent(isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade, {
                    plan: tierToPlan(billingPlan)?.name
                });
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                trackError(
                    e,
                    isUpgrade ? Submit.OrganizationUpgrade : Submit.OrganizationDowngrade
                );
            }
        }
    }

    $: isUpgrade = billingPlan > $organization.billingPlan;

    $: freePlan = $plansInfo.get(BillingPlan.STARTER);
    $: proPlan = $plansInfo.get(BillingPlan.PRO);
    $: if (billingPlan === BillingPlan.PRO) {
        loadPaymentMethods();
    }
</script>

<svelte:head>
    <title>Change plan - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer>
    <WizardSecondaryHeader href={previousPage}>Change plan</WizardSecondaryHeader>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={update} bind:isSubmitting>
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
                                    {#if $organization.billingPlan === BillingPlan.STARTER}
                                        <span class="inline-tag">Current plan</span>
                                    {/if}
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
                                    {#if $organization.billingPlan === BillingPlan.PRO}
                                        <span class="inline-tag">Current plan</span>
                                    {/if}
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
                        bind:tags={collaborators}
                        label="Invite members by email"
                        tooltip="Invited members will have access to all services and payment data within your organization"
                        placeholder="Enter email address(es)"
                        validityRegex={emailRegex}
                        validityMessage="Invalid email address"
                        id="members" />
                    <SelectPaymentMethod bind:methods bind:value={paymentMethodId} bind:taxId
                    ></SelectPaymentMethod>
                </FormList>
                {#if !couponData?.code}
                    <Button
                        text
                        noMargin
                        class="u-margin-block-start-16"
                        on:click={() => (showCreditModal = true)}>
                        <span class="icon-plus"></span> <span class="text">Add credits</span>
                    </Button>
                {/if}
            {/if}
        </Form>
        <svelte:fragment slot="aside">
            {#if billingPlan !== BillingPlan.STARTER}
                <EstimatedTotalBox
                    {billingPlan}
                    {collaborators}
                    bind:couponData
                    bind:billingBudget />
            {:else}
                <PlanComparisonBox />
            {/if}
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile href={`${base}/console`} secondary>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Change plan
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>

<ValidateCreditModal bind:show={showCreditModal} bind:couponData />
