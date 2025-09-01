<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { PlanComparisonBox, PlanSelection, SelectPaymentMethod } from '$lib/components/billing';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import { BillingPlan, Dependencies, feedbackDowngradeOptions } from '$lib/constants';
    import { Button, Form, InputSelect, InputTags, InputTextarea } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers.js';
    import { Wizard } from '$lib/layout';
    import { type Coupon, type PaymentMethodData } from '$lib/sdk/billing';
    import { isOrganization, plansInfo, tierToPlan } from '$lib/stores/billing';
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
        Skeleton,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { loadAvailableRegions } from '$routes/(console)/regions';
    import EstimatedTotalBox from '$lib/components/billing/estimatedTotalBox.svelte';
    import OrganizationUsageLimits from '$lib/components/organizationUsageLimits.svelte';
    import { Query } from '@appwrite.io/console';
    import type { OrganizationUsage } from '$lib/sdk/billing';
    import type { Models } from '@appwrite.io/console';
    import { toLocaleDate } from '$lib/helpers/date';

    export let data;

    let selectedCoupon: Partial<Coupon> = null;

    let selectedPlan: BillingPlan = data.plan as BillingPlan;
    let previousPage: string = base;
    let showExitModal = false;
    let formComponent: Form;
    let usageLimitsComponent:
        | { validateOrAlert: () => boolean; getSelectedProjects: () => string[] }
        | undefined;
    let isSubmitting = writable(false);
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
    let orgUsage: OrganizationUsage;
    let allProjects: { projects: Models.Project[] } | undefined;

    $: paymentMethods = null;

    $: paymentMethodId =
        data.organization.paymentMethodId ??
        paymentMethods?.paymentMethods?.find((method: PaymentMethodData) => !!method?.last4)?.$id;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    onMount(async () => {
        const params = page.url.searchParams;

        const couponCode = params.get('code');
        if (couponCode) {
            try {
                selectedCoupon = await sdk.forConsole.billing.getCouponAccount(couponCode);
            } catch {
                selectedCoupon = { code: null, status: null, credits: null };
            }
        }

        const plan = params.get('plan');
        if (plan && plan in BillingPlan) {
            selectedPlan = plan as BillingPlan;
        }

        if (params.get('type') === 'payment_confirmed') {
            const organizationId = params.get('id');
            const invites = params.get('invites')?.split(',') ?? [];
            await validate(organizationId, invites);
        }

        selectedPlan =
            $currentPlan?.$id === BillingPlan.SCALE ? BillingPlan.SCALE : BillingPlan.PRO;

        try {
            orgUsage = await sdk.forConsole.billing.listUsage(data.organization.$id);
        } catch {
            orgUsage = undefined;
        }

        try {
            allProjects = await sdk.forConsole.projects.list([
                Query.equal('teamId', data.organization.$id),
                Query.limit(1000)
            ]);
        } catch {
            allProjects = { projects: [] };
        }
    });

    async function loadPaymentMethods() {
        paymentMethods = await sdk.forConsole.billing.listPaymentMethods();
        return paymentMethods;
    }

    async function handleSubmit() {
        if (isDowngrade) {
            // If target plan has a non-zero project limit, ensure selection made
            const targetProjectsLimit = $plansInfo?.get(selectedPlan)?.projects ?? 0;
            if (targetProjectsLimit > 0 && usageLimitsComponent?.validateOrAlert) {
                const ok = usageLimitsComponent.validateOrAlert();
                if (!ok) return;
            }

            await downgrade();
        } else if (isUpgrade) {
            await upgrade();
        }
    }

    async function trackDowngradeFeedback() {
        const paidInvoices = await sdk.forConsole.billing.listInvoices(data.organization.$id, [
            Query.equal('status', 'succeeded'),
            Query.greaterThan('grossAmount', 0)
        ]);

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
                orgAge: data.organization.$createdAt,
                userAge: data.account.$createdAt,
                paidInvoices: paidInvoices.total,
                message: feedbackMessage ?? ''
            })
        });
    }

    async function downgrade() {
        try {
            // 1) update the plan first
            await sdk.forConsole.billing.updatePlan(
                data.organization.$id,
                selectedPlan,
                paymentMethodId,
                null
            );

            // 2) If the target plan has a project limit, apply selected projects now
            const targetProjectsLimit = $plansInfo?.get(selectedPlan)?.projects ?? 0;
            if (targetProjectsLimit > 0 && usageLimitsComponent) {
                const selected = usageLimitsComponent.getSelectedProjects();
                if (selected?.length) {
                    try {
                        await sdk.forConsole.billing.updateSelectedProjects(
                            data.organization.$id,
                            selected
                        );
                    } catch (projectError) {
                        console.warn('Project selection failed after plan update:', projectError);
                    }
                }
            }

            await Promise.all([trackDowngradeFeedback(), invalidate(Dependencies.ORGANIZATION)]);

            await goto(previousPage);

            addNotification({
                type: 'success',
                message: `${$organization.name} plan has been successfully updated.`
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
            // Add collaborators
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
                selectedCoupon?.code,
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
                /**
                 * Reload on upgrade (e.g. Free → Paid)
                 */
                loadAvailableRegions(org.$id, true);

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

    $: isUpgrade = $plansInfo.get(selectedPlan).order > $currentPlan?.order;
    $: isDowngrade = $plansInfo.get(selectedPlan).order < $currentPlan?.order;
    $: isButtonDisabled =
        $organization?.billingPlan === selectedPlan ||
        (isDowngrade && selectedPlan === BillingPlan.FREE && data.hasFreeOrgs);
</script>

<svelte:head>
    <title>Change plan - Appwrite</title>
</svelte:head>

<Wizard title="Change plan" href={previousPage} bind:showExitModal confirmExit>
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

                    <PlanSelection bind:billingPlan={selectedPlan} selfService={data.selfService} />

                    {#if isDowngrade && selectedPlan === BillingPlan.FREE && data.hasFreeOrgs}
                        <Alert.Inline
                            status="warning"
                            title="You can only have one free organization per account">
                            To downgrade this organization, first migrate or delete one of your
                            existing paid organizations.
                            <Button
                                compact
                                href="https://appwrite.io/docs/advanced/migrations/cloud"
                                >Migration guide</Button>
                        </Alert.Inline>
                    {/if}

                    {#if isDowngrade}
                        {@const extraMembers = collaborators?.length ?? 0}
                        {@const price = formatCurrency(
                            extraMembers *
                                ($plansInfo?.get(selectedPlan)?.addons?.seats?.price ?? 0)
                        )}
                        {#if selectedPlan === BillingPlan.PRO}
                            <Alert.Inline status="error">
                                <svelte:fragment slot="title">
                                    Your monthly payments will be adjusted for the Pro plan
                                </svelte:fragment>
                                After switching plans,
                                <b
                                    >you will be charged {price} monthly for {extraMembers} team members.</b>
                                This will be reflected in your next invoice.
                            </Alert.Inline>
                        {:else if selectedPlan === BillingPlan.FREE}
                            <Alert.Inline
                                status="error"
                                title={`Your organization will switch to ${tierToPlan(selectedPlan).name} plan on ${toLocaleDate(
                                    $organization.billingNextInvoiceDate
                                )}`}>
                                You will retain access to {tierToPlan($organization.billingPlan)
                                    .name} plan features until your billing period ends. After that,
                                <span class="u-bold"
                                    >all team members except the owner will be removed,</span>
                                and service disruptions may occur if usage exceeds Free plan limits.
                            </Alert.Inline>
                        {/if}

                        <OrganizationUsageLimits
                            bind:this={usageLimitsComponent}
                            organization={data.organization}
                            projects={allProjects?.projects || []}
                            members={data.members?.memberships || []}
                            storageUsage={orgUsage?.storageTotal ?? 0} />
                    {/if}
                </Layout.Stack>
            </Fieldset>

            {#if isUpgrade}
                {#await loadPaymentMethods()}
                    <Fieldset legend="Payment">
                        <Layout.Stack gap="m">
                            <Typography.Text variant="m-500">Payment method</Typography.Text>
                            <Skeleton variant="line" width="100%" height={30} />

                            <Layout.Stack direction="row">
                                <Skeleton variant="line" width="165px" height={30} />
                                <Divider vertical style="height: 2rem" />
                                <Skeleton variant="line" width="100px" height={30} />
                            </Layout.Stack>
                        </Layout.Stack>
                    </Fieldset>
                {:then}
                    <Fieldset legend="Payment">
                        <SelectPaymentMethod
                            bind:taxId
                            bind:value={paymentMethodId}
                            bind:methods={paymentMethods}>
                            <svelte:fragment slot="actions">
                                {#if !selectedCoupon?.code}
                                    {#if paymentMethodId}
                                        <Divider vertical style="height: 2rem" />
                                    {/if}

                                    <Button compact on:click={() => (showCreditModal = true)}>
                                        <Icon icon={IconPlus} slot="start" size="s" />
                                        Add credits
                                    </Button>
                                {/if}
                            </svelte:fragment>
                        </SelectPaymentMethod>
                    </Fieldset>
                {/await}

                <Fieldset legend="Invite members">
                    <InputTags
                        bind:tags={collaborators}
                        label="Invite members by email"
                        placeholder="Enter email address(es)"
                        id="members" />
                </Fieldset>
            {/if}
            {#if isDowngrade && selectedPlan === BillingPlan.FREE && !data.hasFreeOrgs}
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
                billingPlan={selectedPlan}
                bind:couponData={selectedCoupon}
                bind:billingBudget
                organizationId={data.organization.$id} />
        {:else if data.organization.billingPlan !== BillingPlan.CUSTOM}
            <PlanComparisonBox downgrade={data.hasFreeOrgs ? false : isDowngrade} />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            forceShowLoader
            submissionLoader={$isSubmitting}
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
