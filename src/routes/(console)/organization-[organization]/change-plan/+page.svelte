<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { PlanComparisonBox, PlanSelection, SelectPaymentMethod } from '$lib/components/billing';
    import PlanExcess from '$lib/components/billing/planExcess.svelte';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import { BillingPlan, Dependencies, feedbackDowngradeOptions } from '$lib/constants';
    import { Button, Form, InputSelect, InputTags, InputTextarea } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers.js';
    import { Wizard } from '$lib/layout';
    import { type Coupon, type PaymentList } from '$lib/sdk/billing';
    import { isOrganization, plansInfo, tierToPlan, type Tier } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import {
        Alert,
        Divider,
        Fieldset,
        Icon,
        Layout,
        Link,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import EstimatedTotalBox from '$lib/components/billing/estimatedTotalBox.svelte';

    export let data;

    let selectedPlan: BillingPlan = data.plan as BillingPlan;
    let selectedCoupon: Partial<Coupon> | null = data.coupon;
    let previousPage: string = base;
    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);
    let paymentMethodId: string =
        data.organization.paymentMethodId ??
        data.paymentMethods.paymentMethods.find((method) => !!method?.last4)?.$id;
    let collaborators: string[] =
        data?.members?.memberships
            ?.map((m) => {
                if (m.userEmail !== $user.email) return m.userEmail;
            })
            ?.filter(Boolean) ?? [];
    let taxId: string;
    let billingBudget: number;
    let showCreditModal = false;
    let feedbackDowngradeReason: string;
    let feedbackMessage: string;
    let couponData: Partial<Coupon> = data.coupon;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });
    onMount(async () => {
        if (page.url.searchParams.has('code')) {
            const coupon = page.url.searchParams.get('code');
            try {
                const response = await sdk.forConsole.billing.getCouponAccount(coupon);
                couponData = response;
            } catch (e) {
                couponData = {
                    code: null,
                    status: null,
                    credits: null
                };
            }
        }
        if (page.url.searchParams.has('plan')) {
            const plan = page.url.searchParams.get('plan');
            if (plan && plan in BillingPlan) {
                selectedPlan = plan as BillingPlan;
            }
        }

        if (page.url.searchParams.has('type')) {
            const type = page.url.searchParams.get('type');
            if (type === 'payment_confirmed') {
                const organizationId = page.url.searchParams.get('id');
                const invites = page.url.searchParams.get('invites').split(',');
                await validate(organizationId, invites);
            }
        }
        if ($currentPlan?.$id === BillingPlan.SCALE) {
            selectedPlan = BillingPlan.SCALE;
        } else {
            selectedPlan = BillingPlan.PRO;
        }
    });

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
                data.organization.$id,
                selectedPlan,
                paymentMethodId,
                null
            );

            await fetch(`${VARS.GROWTH_ENDPOINT}/feedback/billing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: tierToPlan(data.organization.billingPlan).name,
                    to: tierToPlan(selectedPlan).name,
                    email: data.account.email,
                    reason: feedbackDowngradeOptions.find(
                        (option) => option.value === feedbackDowngradeReason
                    )?.label,
                    orgId: data.organization.$id,
                    userId: data.account.$id,
                    message: feedbackMessage ?? ''
                })
            });

            await invalidate(Dependencies.ORGANIZATION);

            await goto(previousPage);
            addNotification({
                type: 'success',
                isHtml: true,
                message: `<b>${$organization.name}</b> plan has been successfully updated.`
            });

            trackEvent(Submit.OrganizationDowngrade, {
                plan: tierToPlan(selectedPlan)?.name
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
                    plan: tierToPlan(selectedPlan)?.name
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
            //Add collaborators
            let newCollaborators = [];
            if (collaborators?.length) {
                newCollaborators = collaborators.filter(
                    (collaborator) =>
                        !data?.members?.memberships?.find((m) => m.userEmail === collaborator)
                );
            }
            const org = await sdk.forConsole.billing.updatePlan(
                data.organization.$id,
                selectedPlan,
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
                for (const [key, value] of page.url.searchParams.entries()) {
                    if (key !== 'type' && key !== 'id') {
                        params.append(key, value);
                    }
                }
                params.append('type', 'payment_confirmed');
                params.append('id', org.teamId);
                params.append('invites', collaborators.join(','));
                params.append('plan', selectedPlan);
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
                    plan: tierToPlan(selectedPlan)?.name
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

    $: isUpgrade = $plansInfo.get(selectedPlan).order > $currentPlan.order;
    $: isDowngrade = $plansInfo.get(selectedPlan).order < $currentPlan.order;
    $: isButtonDisabled = $organization.billingPlan === selectedPlan;
</script>

<svelte:head>
    <title>Change plan - Appwrite</title>
</svelte:head>

<Wizard
    title="Change plan"
    href={`${base}/organization-${page.params.organization}`}
    bind:showExitModal
    confirmExit>
    <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Select plan">
                <Layout.Stack gap="l">
                    <Typography.Text>
                        For more details on our plans, visit our
                        <Link.Anchor
                            href="https://appwrite.io/pricing"
                            target="_blank"
                            rel="noopener noreferrer">pricing page</Link.Anchor
                        >.
                    </Typography.Text>

                    {#if !data.selfService}
                        <Alert.Inline status="info">
                            Your contract is not eligible for manual changes. Please reach out to
                            schedule a call or setup a dialog.
                        </Alert.Inline>
                    {/if}

                    <PlanSelection
                        bind:billingPlan={selectedPlan}
                        selfService={data.selfService}
                        anyOrgFree={data.hasFreeOrgs} />

                    {#if isDowngrade}
                        {#if selectedPlan === BillingPlan.FREE}
                            <PlanExcess tier={BillingPlan.FREE} />
                        {:else if selectedPlan === BillingPlan.PRO && data.organization.billingPlan === BillingPlan.SCALE && collaborators?.length > 0}
                            {@const extraMembers = collaborators?.length ?? 0}
                            {@const price = formatCurrency(
                                extraMembers *
                                    ($plansInfo?.get(selectedPlan)?.addons?.seats?.price ?? 0)
                            )}
                            <Alert.Inline status="error">
                                <svelte:fragment slot="title">
                                    Your monthly payments will be adjusted for the Pro plan
                                </svelte:fragment>
                                After switching plans,
                                <b
                                    >you will be charged {price} monthly for {extraMembers} team members.</b>
                                This will be reflected in your next invoice.
                            </Alert.Inline>
                        {/if}
                    {/if}
                </Layout.Stack>
            </Fieldset>

            <!-- Show email input if upgrading from free plan -->
            {#if selectedPlan !== BillingPlan.FREE && data.organization.billingPlan === BillingPlan.FREE}
                <Fieldset legend="Payment">
                    <SelectPaymentMethod
                        methods={data.paymentMethods}
                        bind:value={paymentMethodId}
                        bind:taxId>
                        <svelte:fragment slot="actions">
                            {#if !selectedCoupon?.code}
                                <Divider vertical style="height: 2rem" />
                                <Button compact on:click={() => (showCreditModal = true)}>
                                    <Icon icon={IconPlus} slot="start" size="s" />
                                    Add credits
                                </Button>
                            {/if}
                        </svelte:fragment>
                    </SelectPaymentMethod>
                </Fieldset>
                <Fieldset legend="Invite members">
                    <InputTags
                        bind:tags={collaborators}
                        label="Invite members by email"
                        placeholder="Enter email address(es)"
                        id="members" />
                </Fieldset>
            {/if}
            {#if isDowngrade && selectedPlan === BillingPlan.FREE}
                <Fieldset legend="Feedback">
                    <Layout.Stack gap="xl">
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
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        {#if selectedPlan !== BillingPlan.FREE && data.organization.billingPlan !== selectedPlan && data.organization.billingPlan !== BillingPlan.CUSTOM}
            <EstimatedTotalBox
                {collaborators}
                {isDowngrade}
                plans={data.plansInfo}
                billingPlan={selectedPlan}
                bind:couponData={selectedCoupon}
                bind:billingBudget />
        {:else if data.organization.billingPlan !== BillingPlan.CUSTOM}
            <PlanComparisonBox downgrade={isDowngrade} />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting || isButtonDisabled || !data.selfService}>
            Change plan
        </Button>
    </svelte:fragment>
</Wizard>

<ValidateCreditModal
    bind:show={showCreditModal}
    bind:couponData={selectedCoupon}
    isNewOrg={false} />
