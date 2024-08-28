<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
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
    import { Button, Form, FormList, InputTags, InputText, Label } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter,
        WizardSecondaryHeader
    } from '$lib/layout';
    import type { Coupon, PaymentList } from '$lib/sdk/billing';
    import { plansInfo, tierFree, tierPro, tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    $: anyOrgFree = $organizationList.teams?.find(
        (org) => (org as Organization)?.billingPlan === BillingPlan.FREE
    );
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/i;
    let previousPage: string = `${base}/console`;
    let showExitModal = false;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    let formComponent: Form;
    let isSubmitting = writable(false);

    let methods: PaymentList;
    let name: string;
    let billingPlan: BillingPlan = BillingPlan.FREE;
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
            if (plan && Object.values(BillingPlan).includes(plan as BillingPlan)) {
                billingPlan = plan as BillingPlan;
            }
        }
        if (anyOrgFree) {
            billingPlan = BillingPlan.PRO;
        }
    });

    async function loadPaymentMethods() {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        paymentMethodId = methods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
    }

    async function create() {
        try {
            let org: Organization;

            if (billingPlan === BillingPlan.FREE) {
                org = await sdk.forConsole.billing.createOrganization(
                    ID.unique(),
                    name,
                    BillingPlan.FREE,
                    null,
                    null
                );
            } else {
                org = await sdk.forConsole.billing.createOrganization(
                    ID.unique(),
                    name,
                    billingPlan,
                    paymentMethodId,
                    null,
                    couponData?.code,
                    collaborators
                );

                //Add budget
                if (billingBudget) {
                    await sdk.forConsole.billing.updateBudget(org.$id, billingBudget, [75]);
                }

                // //Add coupon
                // if (couponData?.code) {
                //     await sdk.forConsole.billing.addCredit(org.$id, couponData.code);
                //     trackEvent(Submit.CreditRedeem);
                // }

                // //Add collaborators
                // if (collaborators?.length) {
                //     collaborators.forEach(async (collaborator) => {
                //         await sdk.forConsole.teams.createMembership(
                //             org.$id,
                //             ['owner'],
                //             collaborator,
                //             undefined,
                //             undefined,
                //             `${$page.url.origin}/console/organization-${org.$id}`
                //         );
                //     });
                // }

                // Add tax ID
                if (taxId) {
                    await sdk.forConsole.billing.updateTaxId(org.$id, taxId);
                }
            }

            trackEvent(Submit.OrganizationCreate, {
                plan: tierToPlan(billingPlan)?.name,
                budget_cap_enabled: !!billingBudget,
                members_invited: collaborators?.length
            });

            await invalidate(Dependencies.ACCOUNT);
            await preloadData(`${base}/console/organization-${org.$id}`);
            await goto(`${base}/console/organization-${org.$id}`);
            addNotification({
                type: 'success',
                message: `${name ?? 'Organization'} has been created`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.OrganizationCreate);
        }
    }

    $: freePlan = $plansInfo.get(BillingPlan.FREE);
    $: proPlan = $plansInfo.get(BillingPlan.PRO);
    $: if (billingPlan === BillingPlan.PRO) {
        loadPaymentMethods();
    }
</script>

<svelte:head>
    <title>Create organization - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer bind:showExitModal href={previousPage}>
    <WizardSecondaryHeader confirmExit on:exit={() => (showExitModal = true)}>
        Create organization
    </WizardSecondaryHeader>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
            <FormList>
                <InputText
                    bind:value={name}
                    label="Organization name"
                    placeholder="Enter organization name"
                    id="name"
                    required />
            </FormList>
            <Label class="label u-margin-block-start-16">Select plan</Label>
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
            {#if billingPlan !== BillingPlan.FREE}
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
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create organization
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>

<ValidateCreditModal bind:show={showCreditModal} bind:couponData />
