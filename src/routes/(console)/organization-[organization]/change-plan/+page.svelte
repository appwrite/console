<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { PlanComparisonBox, PlanSelection, SelectPaymentMethod } from '$lib/components/billing';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import { Dependencies, feedbackDowngradeOptions } from '$lib/constants';
    import { Button, Form, InputTags, InputTextarea } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers.js';
    import { Wizard } from '$lib/layout';
    import {
        billingIdToPlan,
        getBasePlanFromGroup,
        isPaymentAuthenticationRequired
    } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
    import { user } from '$lib/stores/user';
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
    import { BillingPlanGroup, type Models, Query } from '@appwrite.io/console';
    import { toLocaleDate } from '$lib/helpers/date';

    export let data;

    let selectedPlan: Models.BillingPlan = data.plan;
    let selectedCoupon: Partial<Models.Coupon> = null;

    let previousPage: string = resolve('/');
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
    let orgUsage: Models.UsageOrganization;
    let allProjects: { projects: Models.Project[] } | undefined;

    $: paymentMethods = null;

    $: paymentMethodId =
        data.organization.paymentMethodId ??
        paymentMethods?.paymentMethods?.find((method: Models.PaymentMethod) => !!method?.last4)
            ?.$id;

    afterNavigate(({ from }) => {
        if (from?.url) {
            const search = from.url.search;
            const pathname = from.url.pathname;
            previousPage = search ? `${pathname}${search}` : pathname;
        }
    });

    onMount(async () => {
        const params = page.url.searchParams;

        const couponCode = params.get('code');
        if (couponCode) {
            try {
                selectedCoupon = await sdk.forConsole.account.getCoupon({
                    couponId: couponCode
                });
            } catch {
                selectedCoupon = { code: null, status: null, credits: null };
            }
        }

        const plan = params.get('plan');
        if (plan) {
            // if the org has access,
            // the plan should be available!
            selectedPlan = billingIdToPlan(plan);
        }

        if (params.get('type') === 'payment_confirmed') {
            const organizationId = params.get('id');
            const invites = params.get('invites')?.split(',') ?? [];
            await validate(organizationId, invites);
        }

        const pro = getBasePlanFromGroup(BillingPlanGroup.Pro);
        const scale = getBasePlanFromGroup(BillingPlanGroup.Scale);
        selectedPlan = $currentPlan?.group === BillingPlanGroup.Scale ? scale : pro;

        try {
            orgUsage = await sdk.forConsole.organizations.getUsage({
                organizationId: data.organization.$id
            });
        } catch {
            orgUsage = undefined;
        }

        try {
            allProjects = await sdk.forConsole.projects.list({
                queries: [
                    Query.equal('teamId', data.organization.$id),
                    Query.limit(1000),
                    Query.select(['$id', 'name'])
                ]
            });
        } catch {
            allProjects = { projects: [] };
        }
    });

    async function loadPaymentMethods() {
        paymentMethods = await sdk.forConsole.account.listPaymentMethods();
        return paymentMethods;
    }

    async function handleSubmit() {
        if (isDowngrade) {
            // If target plan has a non-zero project limit, ensure selection made
            const targetProjectsLimit = selectedPlan?.projects ?? 0;
            const shouldShowProjectSelector =
                targetProjectsLimit > 0 && allProjects.projects.length > targetProjectsLimit;

            if (shouldShowProjectSelector && usageLimitsComponent?.validateOrAlert) {
                const ok = usageLimitsComponent.validateOrAlert();
                if (!ok) return;
            }

            await downgrade();
        } else if (isUpgrade) {
            await upgrade();
        }
    }

    async function trackDowngradeFeedback() {
        const selectedReason = feedbackDowngradeOptions.find(
            (option) => option.value === feedbackDowngradeReason
        )?.label;

        const defaultReason = feedbackDowngradeOptions.find(
            (option) => option.value === 'other'
        )?.label;

        await sdk.forConsole.organizations.createDowngradeFeedback({
            organizationId: data.organization.$id,
            reason: selectedReason ?? defaultReason,
            message: feedbackMessage ?? '',
            fromPlanId: data.organization.billingPlanId,
            toPlanId: selectedPlan.$id
        });
    }

    async function downgrade() {
        try {
            // 1) update the plan first
            await sdk.forConsole.organizations.updatePlan({
                organizationId: data.organization.$id,
                billingPlan: selectedPlan.$id,
                paymentMethodId
            });

            // 2) If the target plan has a project limit, apply selected projects now
            const targetProjectsLimit = selectedPlan?.projects ?? 0;
            if (targetProjectsLimit > 0 && usageLimitsComponent) {
                const selected = usageLimitsComponent.getSelectedProjects();
                if (selected?.length) {
                    try {
                        await sdk.forConsole.organizations.updateProjects({
                            organizationId: data.organization.$id,
                            projects: selected
                        });
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
                plan: selectedPlan?.name
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
            let org = await sdk.forConsole.organizations.validatePayment({
                organizationId,
                invites
            });

            if (!isPaymentAuthenticationRequired(org)) {
                await invalidate(Dependencies.ACCOUNT);
                await invalidate(Dependencies.ORGANIZATION);

                await goto(previousPage);
                addNotification({
                    type: 'success',
                    message: 'Your organization has been upgraded'
                });

                trackEvent(Submit.OrganizationUpgrade, {
                    plan: selectedPlan?.name
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
            const org = await sdk.forConsole.organizations.updatePlan({
                organizationId: data.organization.$id,
                billingPlan: selectedPlan.$id,
                paymentMethodId,
                couponId: selectedCoupon?.code,
                invites: newCollaborators,
                budget: billingBudget,
                taxId: taxId ? taxId : null
            });

            if (isPaymentAuthenticationRequired(org)) {
                let clientSecret = org.clientSecret;
                let params = new URLSearchParams();
                for (const [key, value] of page.url.searchParams.entries()) {
                    if (key !== 'type' && key !== 'id') {
                        params.append(key, value);
                    }
                }
                params.append('type', 'payment_confirmed');
                params.append('id', org.organizationId);
                params.append('invites', collaborators.join(','));
                params.append('plan', selectedPlan.$id);

                const resolvedUrl = resolve('/(console)/organization-[organization]/change-plan', {
                    organization: org.organizationId
                });

                await confirmPayment({
                    clientSecret,
                    paymentMethodId,
                    route: `${resolvedUrl}?${params.toString()}`
                });
                await validate(org.organizationId, collaborators);
            }

            if (!isPaymentAuthenticationRequired(org)) {
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
                    plan: selectedPlan?.name
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

    $: isUpgrade = selectedPlan.order > $currentPlan?.order;
    $: isDowngrade = selectedPlan.order < $currentPlan?.order;
    $: isButtonDisabled =
        $organization?.billingPlanId === selectedPlan.$id ||
        (isDowngrade && selectedPlan.group === BillingPlanGroup.Starter && data.hasFreeOrgs);
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

                    <PlanSelection
                        anyOrgFree={data.hasFreeOrgs}
                        selfService={data.selfService}
                        bind:selectedBillingPlan={selectedPlan} />

                    {#if isDowngrade && selectedPlan.group === BillingPlanGroup.Starter && data.hasFreeOrgs}
                        <Alert.Inline
                            status="warning"
                            title="You can only have one free organization per account">
                            To downgrade this organization, first migrate or delete your existing
                            free organization.
                            <Layout.Stack gap="xs" direction="row" justifyContent="flex-start">
                                <Button
                                    compact
                                    external
                                    href="https://appwrite.io/docs/advanced/migrations/cloud"
                                    >Migration guide</Button>
                            </Layout.Stack>
                        </Alert.Inline>
                    {/if}

                    {#if isDowngrade}
                        {@const extraMembers = collaborators?.length ?? 0}
                        {@const price = formatCurrency(
                            extraMembers * (selectedPlan?.addons?.seats?.price ?? 0)
                        )}

                        {#if selectedPlan.price > 0}
                            <Alert.Inline status="error">
                                <svelte:fragment slot="title">
                                    Your monthly payments will be adjusted for the Pro plan
                                </svelte:fragment>
                                After switching plans,
                                <b
                                    >you will be charged {price} monthly for {extraMembers} team members.</b>
                                This will be reflected in your next invoice.
                            </Alert.Inline>
                        {:else}
                            <Alert.Inline
                                status="error"
                                title={`Your organization will switch to ${selectedPlan.name} plan on ${toLocaleDate(
                                    $organization.billingNextInvoiceDate
                                )}`}>
                                You will retain access to {$organization.billingPlanDetails.name} plan
                                features until your billing period ends. After that,
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
            {#if isDowngrade && selectedPlan.group === BillingPlanGroup.Starter && !data.hasFreeOrgs}
                <Fieldset legend="Feedback">
                    <Layout.Stack gap="xl">
                        <!--<InputSelect
                            id="reason"
                            label="Reason for plan change"
                            placeholder="Select one"
                            required
                            options={feedbackDowngradeOptions}
                            bind:value={feedbackDowngradeReason} />-->
                        <InputTextarea
                            id="comment"
                            required
                            label="What wasn't working for you?"
                            placeholder="Please share anything that influenced your decision to downgrade. This feedback helps us improve the platform."
                            bind:value={feedbackMessage} />
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        {@const isStarter = selectedPlan.group === BillingPlanGroup.Starter}
        {@const isSelfService = data.organization.billingPlanDetails.selfService}
        {@const isSameGroup = data.organization.billingPlanDetails.group === selectedPlan.group}
        {#if !isStarter && !isSameGroup && !isSelfService}
            <EstimatedTotalBox
                {collaborators}
                {isDowngrade}
                billingPlan={selectedPlan}
                bind:couponData={selectedCoupon}
                bind:billingBudget
                organizationId={data.organization.$id} />
        {:else if !data.organization.billingPlanDetails.selfService}
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
