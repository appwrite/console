<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { PlanComparisonBox, PlanSelection, SelectPaymentMethod } from '$lib/components/billing';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, InputTags, InputText } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import type { Coupon } from '$lib/sdk/billing';
    import { isOrganization, tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import type { OrganizationError, Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
    import { ID } from '@appwrite.io/console';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Divider, Fieldset, Icon, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import EstimatedTotalBox from '$lib/components/billing/estimatedTotalBox.svelte';
    import { onMount } from 'svelte';

    export let data;

    let selectedPlan: BillingPlan = data.plan as BillingPlan;
    let selectedCoupon: Partial<Coupon> | null = data.coupon;
    let previousPage: string = base;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name: string;
    let billingPlan: BillingPlan = BillingPlan.FREE;
    let paymentMethodId: string;
    let collaborators: string[] = [];
    let taxId: string;

    let billingBudget: number;
    let showCreditModal = false;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    onMount(async () => {
        if (page.url.searchParams.has('coupon')) {
            const coupon = page.url.searchParams.get('coupon');
            try {
                const response = await sdk.forConsole.billing.getCouponAccount(coupon);
                selectedCoupon = response;
            } catch (e) {
                selectedCoupon = {
                    code: null,
                    status: null,
                    credits: null
                };
            }
        }
        if (page.url.searchParams.has('name')) {
            name = page.url.searchParams.get('name');
        }
        if (page.url.searchParams.has('plan')) {
            const plan = page.url.searchParams.get('plan');
            if (plan && Object.values(BillingPlan).includes(plan as BillingPlan)) {
                billingPlan = plan as BillingPlan;
            }
        }
        if (
            data?.hasFreeOrganizations ||
            (page.url.searchParams.has('type') && page.url.searchParams.get('type') === 'createPro')
        ) {
            billingPlan = BillingPlan.PRO;
        }
        if (page.url.searchParams.has('type')) {
            const type = page.url.searchParams.get('type');
            if (type === 'payment_confirmed') {
                const organizationId = page.url.searchParams.get('id');
                const invites = page.url.searchParams.get('invites').split(',');
                await validate(organizationId, invites);
            }
        }
    });

    async function validate(organizationId: string, invites: string[]) {
        try {
            const org = await sdk.forConsole.billing.validateOrganization(organizationId, invites);
            if (isOrganization(org)) {
                await preloadData(`${base}/console/organization-${org.$id}`);
                await goto(`${base}/console/organization-${org.$id}`);
                addNotification({
                    type: 'success',
                    message: `${org.name ?? 'Organization'} has been created`
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

    async function create() {
        try {
            let org: Organization | OrganizationError;

            if (selectedPlan === BillingPlan.FREE) {
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
                    selectedPlan,
                    paymentMethodId,
                    null,
                    selectedCoupon?.code,
                    collaborators,
                    billingBudget,
                    taxId
                );

                if (!isOrganization(org) && org.status === 402) {
                    let clientSecret = org.clientSecret;
                    let params = new URLSearchParams();
                    params.append('type', 'payment_confirmed');
                    params.append('id', org.teamId);
                    for (const [key, value] of page.url.searchParams.entries()) {
                        if (key !== 'type' && key !== 'id') {
                            params.append(key, value);
                        }
                    }
                    params.append('invites', collaborators.join(','));
                    await confirmPayment(
                        '',
                        clientSecret,
                        paymentMethodId,
                        `/console/create-organization?${params}`
                    );
                    await validate(org.teamId, collaborators);
                }
            }

            trackEvent(Submit.OrganizationCreate, {
                plan: tierToPlan(billingPlan)?.name,
                budget_cap_enabled: billingBudget !== null,
                members_invited: collaborators?.length
            });

            if (isOrganization(org)) {
                await invalidate(Dependencies.ACCOUNT);
                await preloadData(`${base}/organization-${org.$id}`);
                await goto(`${base}/organization-${org.$id}`);
                addNotification({
                    type: 'success',
                    message: `${org.name ?? 'Organization'} has been created`
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
</script>

<svelte:head>
    <title>Create organization - Appwrite</title>
</svelte:head>

<Wizard title="Create organization" href={previousPage} bind:showExitModal confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Options">
                <InputText
                    bind:value={name}
                    label="Organization name"
                    placeholder="Enter organization name"
                    id="name"
                    required />
            </Fieldset>
            <Fieldset legend="Select plan">
                <Layout.Stack>
                    <Typography.Text>
                        For more details on our plans, visit our
                        <Link.Anchor
                            href="https://appwrite.io/pricing"
                            target="_blank"
                            rel="noopener noreferrer">pricing page</Link.Anchor
                        >.
                    </Typography.Text>

                    <PlanSelection
                        bind:billingPlan={selectedPlan}
                        anyOrgFree={data.hasFreeOrganizations}
                        isNewOrg />
                </Layout.Stack>
            </Fieldset>
            {#if selectedPlan !== BillingPlan.FREE}
                <Fieldset legend="Payment">
                    <Layout.Stack gap="s" alignItems="flex-start">
                        <SelectPaymentMethod
                            methods={data.paymentMethods}
                            bind:value={paymentMethodId}
                            bind:taxId>
                            <svelte:fragment slot="actions">
                                {#if !selectedCoupon?.code && paymentMethodId}
                                    <Divider vertical style="height: 2rem;" />
                                    <Button compact on:click={() => (showCreditModal = true)}>
                                        <Icon icon={IconPlus} slot="start" size="s" />
                                        Add credits
                                    </Button>
                                {/if}
                            </svelte:fragment>
                        </SelectPaymentMethod>

                        {#if !selectedCoupon?.code && !paymentMethodId}
                            <Button compact on:click={() => (showCreditModal = true)}>
                                <Icon icon={IconPlus} slot="start" size="s" />
                                Add credits
                            </Button>
                        {/if}
                    </Layout.Stack>
                </Fieldset>
                <Fieldset legend="Invite members">
                    <InputTags
                        bind:tags={collaborators}
                        label="Invite members by email"
                        placeholder="Enter email address(es)"
                        id="members" />
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        {#if selectedPlan !== BillingPlan.FREE}
            <EstimatedTotalBox
                billingPlan={selectedPlan}
                {collaborators}
                bind:couponData={selectedCoupon}
                bind:billingBudget />
        {:else}
            <PlanComparisonBox />
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create organization
        </Button>
    </svelte:fragment>
</Wizard>

<ValidateCreditModal bind:show={showCreditModal} bind:couponData={selectedCoupon} isNewOrg />
