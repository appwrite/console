<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { PlanComparisonBox, SelectPaymentMethod, SelectPlan } from '$lib/components/billing';
    import EstimatedTotal from '$lib/components/billing/estimatedTotal.svelte';
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
    import { isOrganization, tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import {
        organizationList,
        type OrganizationError,
        type Organization
    } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
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
        if ($page.url.searchParams.has('type')) {
            const type = $page.url.searchParams.get('type');
            if (type === 'payment_confirmed') {
                const organizationId = $page.url.searchParams.get('id');
                const invites = $page.url.searchParams.get('invites').split(',');
                await validate(organizationId, invites);
            }
        }
    });

    async function loadPaymentMethods() {
        methods = await sdk.forConsole.billing.listPaymentMethods();
        paymentMethodId = methods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
    }

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
                    couponData.code ? couponData.code : null,
                    collaborators,
                    billingBudget,
                    taxId
                );

                if (!isOrganization(org) && org.status === 402) {
                    let clientSecret = org.clientSecret;
                    let params = new URLSearchParams();
                    params.append('type', 'payment_confirmed');
                    params.append('id', org.teamId);
                    for (const [key, value] of $page.url.searchParams.entries()) {
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
            <SelectPlan bind:billingPlan {anyOrgFree} isNewOrg />
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
                <EstimatedTotal bind:billingBudget {billingPlan} {collaborators} bind:couponData />
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
