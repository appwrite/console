<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert } from '$lib/components';
    import { PlanComparisonBox, SelectPaymentMethod } from '$lib/components/billing';
    import EstimatedTotal from '$lib/components/billing/estimatedTotal.svelte';
    import PlanExcess from '$lib/components/billing/planExcess.svelte';
    import SelectPlan from '$lib/components/billing/selectPlan.svelte';
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
    import { toLocaleDate } from '$lib/helpers/date.js';
    import { formatCurrency } from '$lib/helpers/numbers';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { type Coupon, type PaymentList } from '$lib/sdk/billing';
    import { isOrganization, plansInfo, type Tier, tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import {
        currentPlan,
        organization,
        type Organization,
        organizationList
    } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
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
    let billingPlan: Tier = $currentPlan?.$id as Tier;
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
                couponData = await sdk.forConsole.billing.getCouponAccount(coupon);
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

        if ($page.url.searchParams.has('type')) {
            const type = $page.url.searchParams.get('type');
            if (type === 'payment_confirmed') {
                const organizationId = $page.url.searchParams.get('id');
                const invites = $page.url.searchParams.get('invites').split(',');
                await validate(organizationId, invites);
            }
        }
        if ($currentPlan?.$id === BillingPlan.SCALE) {
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
                selectedOrg.$id,
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
                    from: tierToPlan($currentPlan?.$id as Tier).name,
                    to: tierToPlan(billingPlan).name,
                    email: $user.email,
                    reason: feedbackDowngradeOptions.find(
                        (option) => option.value === feedbackDowngradeReason
                    )?.label,
                    orgId: selectedOrg.$id,
                    userId: $user.$id,
                    message: feedbackMessage ?? ''
                })
            });

            await invalidate(Dependencies.ORGANIZATION);

            await goto(previousPage);
            addNotification({
                type: 'success',
                isHtml: true,
                message: `
                        <b>${selectedOrg.name}</b> plan has been successfully updated.`
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

    async function validate(organizationId: string, invites: string[]) {
        try {
            let org = await sdk.forConsole.billing.validateOrganization(organizationId, invites);
            if (isOrganization(org)) {
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
            }
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.OrganizationCreate);
        }
    }

    async function upgrade() {
        try {
            // Add collaborators
            let newCollaborators = [];
            if (collaborators?.length) {
                newCollaborators = collaborators.filter(
                    (collaborator) =>
                        !data?.members?.memberships?.find((m) => m.userEmail === collaborator)
                );
            }
            const org = await sdk.forConsole.billing.updatePlan(
                selectedOrg.$id,
                billingPlan,
                paymentMethodId,
                null,
                couponData?.code,
                newCollaborators,
                billingBudget,
                taxId ? taxId : null
            );

            if (!isOrganization(org) && org.status == 402) {
                let clientSecret = org.clientSecret;
                let params = new URLSearchParams();
                for (const [key, value] of $page.url.searchParams.entries()) {
                    if (key !== 'type' && key !== 'id') {
                        params.append(key, value);
                    }
                }
                params.append('type', 'payment_confirmed');
                params.append('id', org.teamId);
                params.append('invites', collaborators.join(','));
                params.append('plan', billingPlan);
                await confirmPayment(
                    '',
                    clientSecret,
                    paymentMethodId,
                    '/console/change-plan?' + params.toString()
                );
                await validate(org.teamId, collaborators);
            }

            if (isOrganization(org)) {
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
            }
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.OrganizationUpgrade);
        }
    }

    $: selectedOrg =
        $organization ??
        ($organizationList.teams.find(
            (team) => team.$id === $page.params.organization
        ) as Organization);
    $: currentOrgPlan = $currentPlan ?? $plansInfo.get(selectedOrg?.billingPlan);
    $: isSamePlan = billingPlan === currentOrgPlan.$id;
    $: isUpgrade = isSamePlan ? false : $plansInfo.get(billingPlan)?.order > currentOrgPlan.order;
    $: isDowngrade = isSamePlan ? false : $plansInfo.get(billingPlan)?.order < currentOrgPlan.order;
    $: if (billingPlan !== BillingPlan.FREE) {
        loadPaymentMethods();
    }
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
            <SelectPlan bind:billingPlan anyOrgFree={!!anyOrgFree} class="u-margin-block-16" />

            {#if isDowngrade}
                {#if billingPlan === BillingPlan.FREE}
                    <PlanExcess
                        tier={BillingPlan.FREE}
                        class="u-margin-block-start-24"
                        members={data?.members?.total ?? 0} />
                {:else}
                    {@const extraMembers = collaborators?.length ?? 0}
                    <Alert type="warning" class="u-margin-block-start-24">
                        <svelte:fragment slot="title">
                            Your organization will switch to {tierToPlan(billingPlan).name} plan on {toLocaleDate(
                                selectedOrg.billingNextInvoiceDate
                            )}.
                        </svelte:fragment>
                        You will retain access to {tierToPlan(selectedOrg.billingPlan).name} plan features
                        until your billing period ends. {#if extraMembers > 0}After that,
                            <b
                                >you will be charged {formatCurrency(
                                    extraMembers *
                                        ($plansInfo?.get(billingPlan)?.addons?.seats?.price ?? 0)
                                )} per month for {extraMembers} team members.</b
                            >{/if}
                    </Alert>
                {/if}
            {/if}
            <!-- Show email input if upgrading from free plan -->
            {#if billingPlan !== BillingPlan.FREE && selectedOrg.billingPlan !== billingPlan && selectedOrg.billingPlan !== BillingPlan.CUSTOM && isUpgrade}
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
            {#if isDowngrade && billingPlan === BillingPlan.FREE}
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
            {#if billingPlan !== BillingPlan.FREE && selectedOrg.billingPlan !== billingPlan && selectedOrg.billingPlan !== BillingPlan.CUSTOM && isUpgrade}
                <EstimatedTotal
                    bind:billingBudget
                    bind:couponData
                    organizationId={selectedOrg.$id}
                    {billingPlan}
                    {collaborators} />
            {:else if selectedOrg.billingPlan !== BillingPlan.CUSTOM}
                <PlanComparisonBox downgrade={isDowngrade} />
            {/if}
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting || isSamePlan || !selfService}>
            Change plan
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>

<ValidateCreditModal bind:show={showCreditModal} bind:couponData />
