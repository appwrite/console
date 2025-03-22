<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        EstimatedTotalBox,
        PlanComparisonBox,
        PlanSelection,
        SelectPaymentMethod
    } from '$lib/components/billing';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import Default from '$lib/components/roles/default.svelte';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputTags, InputText, Label } from '$lib/elements/forms';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import type { Coupon, PaymentList } from '$lib/sdk/billing';
    import { tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    $: anyOrgFree = $organizationList.teams?.some(
        (org) => (org as Organization)?.billingPlan === BillingPlan.FREE
    );
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/i;
    let previousPage: string = base;
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
        if (
            anyOrgFree ||
            ($page.url.searchParams.has('type') &&
                $page.url.searchParams.get('type') === 'createPro')
        ) {
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
                    null
                );

                //Add budget
                if (billingBudget) {
                    await sdk.forConsole.billing.updateBudget(org.$id, billingBudget, [75]);
                }

                //Add coupon
                if (couponData?.code) {
                    await sdk.forConsole.billing.addCredit(org.$id, couponData.code);
                    trackEvent(Submit.CreditRedeem);
                }

                //Add collaborators
                if (collaborators?.length) {
                    collaborators.forEach(async (collaborator) => {
                        await sdk.forConsole.teams.createMembership(
                            org.$id,
                            ['developer'],
                            collaborator,
                            undefined,
                            undefined,
                            `${$page.url.origin}${base}/invite`
                        );
                    });
                }

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
            await preloadData(`${base}/organization-${org.$id}`);
            await goto(`${base}/organization-${org.$id}`);
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

    $: if (billingPlan !== BillingPlan.FREE) {
        loadPaymentMethods();
    }
</script>

<svelte:head>
    <title>Create organization - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer bind:showExitModal href={previousPage} confirmExit>
    <svelte:fragment slot="title">Create organization</svelte:fragment>
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
            <PlanSelection bind:billingPlan {anyOrgFree} isNewOrg />
            {#if billingPlan !== BillingPlan.FREE}
                <FormList class="u-margin-block-start-24">
                    <InputTags
                        bind:tags={collaborators}
                        label="Invite members by email"
                        popover={Default}
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
