<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert } from '$lib/components';
    import {
        EstimatedTotalBox,
        PlanComparisonBox,
        SelectPaymentMethod
    } from '$lib/components/billing';
    import PlanExcess from '$lib/components/billing/planExcess.svelte';
    import PlanSelection from '$lib/components/billing/planSelection.svelte';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import Default from '$lib/components/roles/default.svelte';
    import { BillingPlan, Dependencies, feedbackDowngradeOptions } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputSelect,
        InputTags,
        InputTextarea,
        Label
    } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers.js';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { type Coupon, type PaymentList } from '$lib/sdk/billing';
    import { plansInfo, tierToPlan, type Tier } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import {
        currentPlan,
        organization,
        organizationList,
        type Organization
    } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export let data;

    $: anyOrgFree = $organizationList.teams?.find(
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
    let billingPlan: Tier = $organization.billingPlan;
    let paymentMethodId: string;
    let collaborators: string[] =
        data?.members?.memberships
            ?.map((m) => {
                if (m.userEmail !== $user.email) return m.userEmail;
            })
            ?.filter(Boolean) ?? [];
    let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };
    let taxId: string;
    let billingBudget: number;
    let showCreditModal = false;

    let feedbackDowngradeReason: string;
    let feedbackMessage: string;
    let selfService: boolean;

    onMount(async () => {
        if ($page.url.searchParams.has('code')) {
            const coupon = $page.url.searchParams.get('code');
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
        if ($page.url.searchParams.has('plan')) {
            const plan = $page.url.searchParams.get('plan');
            if (plan && plan in BillingPlan) {
                billingPlan = plan as BillingPlan;
            }
        }
        if ($organization?.billingPlan === BillingPlan.SCALE) {
            billingPlan = BillingPlan.SCALE;
        } else {
            billingPlan = BillingPlan.PRO;
        }

        selfService = $currentPlan?.selfService ?? true;
    });

    async function loadPaymentMethods() {
        methods = await sdk.forConsole.billing.listPaymentMethods();

        paymentMethodId =
            $organization?.paymentMethodId ??
            methods.paymentMethods.find((method) => !!method?.last4)?.$id ??
            null;
    }

    async function handleSubmit() {
        if (isDowngrade) {
            await downgrade();
        } else if (isUpgrade) {
            await upgrade();
        }
    }

    async function downgrade() {
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

            await goto(previousPage);
            addNotification({
                type: 'success',
                isHtml: true,
                message: `
                        <b>${$organization.name}</b> will change to ${
                            tierToPlan(billingPlan).name
                        } plan at the end of the current billing cycle.`
            });

            trackEvent(Submit.OrganizationDowngrade, {
                plan: tierToPlan(billingPlan)?.name
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.OrganizationDowngrade);
        }
    }

    async function upgrade() {
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
                const newCollaborators = collaborators.filter(
                    (collaborator) =>
                        !data?.members?.memberships?.find((m) => m.userEmail === collaborator)
                );
                newCollaborators.forEach(async (collaborator) => {
                    await sdk.forConsole.teams.createMembership(
                        org.$id,
                        ['owner'],
                        collaborator,
                        undefined,
                        undefined,
                        `${$page.url.origin}${base}/invite`
                    );
                });
            }

            //Add tax ID
            if (taxId) {
                await sdk.forConsole.billing.updateTaxId(org.$id, taxId);
            }

            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);

            await goto(previousPage);
            addNotification({
                type: 'success',
                message: 'Your organization has been upgraded'
            });

            trackEvent(Submit.OrganizationUpgrade, {
                plan: tierToPlan(billingPlan)?.name
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.OrganizationUpgrade);
        }
    }

    $: isUpgrade = billingPlan > $organization.billingPlan;
    $: isDowngrade = billingPlan < $organization.billingPlan;
    $: if (billingPlan !== BillingPlan.FREE) {
        loadPaymentMethods();
    }
    $: isButtonDisabled = $organization.billingPlan === billingPlan;
</script>

<svelte:head>
    <title>Change plan - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer bind:showExitModal href={previousPage} confirmExit>
    <svelte:fragment slot="title">Change plan</svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
            <Label class="label u-margin-block-start-16">Select plan</Label>
            <p class="text">
                For more details on our plans, visit our
                <Button href="https://appwrite.io/pricing" external link>pricing page</Button>.
            </p>
            {#if !selfService}
                <Alert class="u-position-relative u-margin-block-start-16" type="info"
                    >Your contract is not eligible for manual changes. Please reach out to schedule
                    a call or setup a dialog.</Alert>
            {/if}
            <PlanSelection
                bind:billingPlan
                bind:selfService
                anyOrgFree={!!anyOrgFree}
                class="u-margin-block-16" />

            {#if isDowngrade}
                {#if billingPlan === BillingPlan.FREE}
                    <PlanExcess
                        tier={BillingPlan.FREE}
                        class="u-margin-block-start-24"
                        members={data?.members?.total ?? 0} />
                {:else if billingPlan === BillingPlan.PRO && $organization.billingPlan === BillingPlan.SCALE}
                    {@const extraMembers = collaborators?.length ?? 0}
                    <Alert type="error" class="u-margin-block-start-24">
                        <svelte:fragment slot="title">
                            Your monthly payments will be adjusted for the Pro plan
                        </svelte:fragment>
                        After switching plans,
                        <b
                            >you will be charged {formatCurrency(
                                extraMembers *
                                    ($plansInfo?.get(billingPlan)?.addons?.member?.price ?? 0)
                            )} monthly for {extraMembers} team members.</b> This will be reflected in
                        your next invoice.
                    </Alert>
                {/if}
            {/if}
            <!-- Show email input if upgrading from free plan -->
            {#if billingPlan !== BillingPlan.FREE && $organization.billingPlan === BillingPlan.FREE}
                <FormList class="u-margin-block-start-16">
                    <InputTags
                        bind:tags={collaborators}
                        label="Invite members by email"
                        popover={Default}
                        placeholder="Enter email address(es)"
                        validityRegex={emailRegex}
                        validityMessage="Invalid email address"
                        id="members" />
                    <SelectPaymentMethod bind:methods bind:value={paymentMethodId} bind:taxId />
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
            {#if isDowngrade}
                <FormList class="u-margin-block-start-24">
                    <InputSelect
                        id="reason"
                        label="Reason for plan change"
                        placeholder="Select one"
                        required
                        options={feedbackDowngradeOptions}
                        bind:value={feedbackDowngradeReason} />
                    <InputTextarea
                        id="comment"
                        required
                        label="If you need to elaborate, please do so here"
                        placeholder="Enter feedback"
                        bind:value={feedbackMessage} />
                </FormList>
            {/if}
        </Form>
        <svelte:fragment slot="aside">
            {#if billingPlan !== BillingPlan.FREE && $organization.billingPlan !== billingPlan && $organization.billingPlan !== BillingPlan.CUSTOM}
                <EstimatedTotalBox
                    {billingPlan}
                    {collaborators}
                    bind:couponData
                    bind:billingBudget
                    {isDowngrade} />
            {:else if $organization.billingPlan !== BillingPlan.CUSTOM}
                <PlanComparisonBox downgrade={isDowngrade} />
            {/if}
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting || isButtonDisabled || !selfService}>
            Change plan
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>

<ValidateCreditModal bind:show={showCreditModal} bind:couponData />
