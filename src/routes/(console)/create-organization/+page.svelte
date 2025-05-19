<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { PlanComparisonBox, PlanSelection, SelectPaymentMethod } from '$lib/components/billing';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputTags, InputText } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import type { Coupon } from '$lib/sdk/billing';
    import { isOrganization, isOrganizationError, tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { type OrganizationError } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
    import { BillingPlan, ID, type Models } from '@appwrite.io/console';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Divider, Fieldset, Icon, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';
    import EstimatedTotalBox from '$lib/components/billing/estimatedTotalBox.svelte';
    import { onMount } from 'svelte';

    export let data;

    let selectedPlan: BillingPlan = data.plan;
    let selectedCoupon: Partial<Coupon> | null = data.coupon;
    let previousPage: string = base;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name: string;
    let billingPlan: BillingPlan = BillingPlan.Tier0;
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

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    onMount(async () => {
        if (page.url.searchParams.has('coupon')) {
            const coupon = page.url.searchParams.get('coupon');
            try {
                const response = await sdk.forConsole.account.getCoupon(coupon);
                couponData = response;
            } catch (e) {
                couponData = {
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
            billingPlan = BillingPlan.Tier1;
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
            let org: Models.Organization<Record<string, unknown>> | OrganizationError;

            if (selectedPlan === BillingPlan.Tier0) {
                org = await sdk.forConsole.organizations.create(ID.unique(), name, selectedPlan);
            } else {
                org = await sdk.forConsole.organizations.create(
                    ID.unique(),
                    name,
                    selectedPlan,
                    paymentMethodId,
                    null,
                    collaborators,
                    couponData.code ? couponData.code : null,
                    taxId,
                    billingBudget
                );

                if (isOrganizationError(org) && org.status === 402) {
                    const clientSecret = org.clientSecret;
                    const params = new URLSearchParams();
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
                        '/console/create-organization?' + params.toString()
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
            </Fieldset>
            {#if selectedPlan !== BillingPlan.Tier0}
                <Fieldset legend="Payment">
                    <SelectPaymentMethod
                        methods={data.paymentMethods}
                        bind:value={paymentMethodId}
                        bind:taxId>
                        <svelte:fragment slot="actions">
                            {#if !selectedCoupon?.code}
                                <Divider vertical style="height: 2rem;" />
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
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        {#if selectedPlan !== BillingPlan.Tier0}
            <EstimatedTotalBox
                billingPlan={selectedPlan}
                {collaborators}
                plans={data.plansInfo}
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
