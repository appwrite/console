<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CreditsApplied, EstimatedTotal, SelectPaymentMethod } from '$lib/components/billing';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputSelect, InputTags, InputText } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { type PaymentList, type Plan } from '$lib/sdk/billing';
    import { app } from '$lib/stores/app';
    import { isOrganization } from '$lib/stores/billing.js';
    import { addNotification } from '$lib/stores/notifications';
    import {
        organizationList,
        type Organization,
        type OrganizationError
    } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe.js';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { getCampaignImageUrl } from '$routes/(public)/card/helpers';

    export let data;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/i;
    let previousPage: string = base;
    let showExitModal = false;
    let canSelectOrg = true;

    afterNavigate(({ from }) => {
        if (from?.url?.pathname) {
            if (from.url.pathname.includes('/login') || from.url.pathname.includes('/register')) {
                previousPage = base;
            } else {
                previousPage = from?.url?.pathname || previousPage;
            }
        } else {
            previousPage = base;
        }
    });

    let selectedOrgId: string = null;
    let formComponent: Form;
    let couponForm: Form;
    let isSubmitting = writable(false);
    let methods: PaymentList;
    let paymentMethodId: string;
    let collaborators: string[];
    let taxId: string;
    let billingBudget: number;
    let newOrgId = ID.unique();
    let options = [
        ...($organizationList?.teams?.map((team) => ({
            value: team.$id,
            label: team.name
        })) ?? []),
        {
            value: newOrgId,
            label: 'Create new organization'
        }
    ];
    let name: string;
    let coupon: string;
    let couponData = data?.couponData;
    let campaign = data?.campaign;
    let billingPlan = BillingPlan.PRO;
    let currentPlan: Plan;

    function isUpgrade() {
        const newPlan = $page.data.plansInfo.get(billingPlan);
        return currentPlan && newPlan && currentPlan.order < newPlan.order;
    }

    onMount(async () => {
        await loadPaymentMethods();
        if (!$organizationList?.total || campaign?.onlyNewOrgs) {
            selectedOrgId = newOrgId;
        }
        if ($page.url.searchParams.has('org')) {
            selectedOrgId = $page.url.searchParams.get('org');
            canSelectOrg = false;
        }
        if (campaign?.plan) {
            billingPlan = campaign.plan;
        }

        if ($page.url.searchParams.has('type')) {
            const type = $page.url.searchParams.get('type');
            if (type === 'payment_confirmed') {
                const organizationId = $page.url.searchParams.get('id');
                collaborators = $page.url.searchParams.get('invites').split(',');

                await sdk.forConsole.billing.validateOrganization(organizationId, collaborators);
            }
        }

        if (!selectedOrgId && $organizationList?.total) {
            selectedOrgId = $organizationList.teams[0].$id;
        }
    });

    async function loadPaymentMethods() {
        const methodList = await sdk.forConsole.billing.listPaymentMethods();
        const filteredMethods = methodList.paymentMethods.filter((method) => !!method?.last4);
        methods = { paymentMethods: filteredMethods, total: filteredMethods.length };
        paymentMethodId =
            selectedOrg?.paymentMethodId ??
            methods.paymentMethods.find((method) => !!method?.last4)?.$id ??
            null;
    }

    async function handleSubmit() {
        if (!couponForm.checkValidity()) return;
        isSubmitting.set(true);
        try {
            let org: Organization | OrganizationError;
            // Create new org
            if (selectedOrgId === newOrgId) {
                org = await sdk.forConsole.billing.createOrganization(
                    newOrgId,
                    name,
                    billingPlan,
                    paymentMethodId,
                    null,
                    couponData.code ? couponData.code : null,
                    collaborators,
                    billingBudget,
                    taxId
                );
            }

            // Upgrade existing org
            else if (selectedOrg?.billingPlan !== billingPlan && isUpgrade()) {
                org = await sdk.forConsole.billing.updatePlan(
                    selectedOrg.$id,
                    billingPlan,
                    paymentMethodId,
                    null,
                    couponData.code ? couponData.code : null,
                    collaborators
                );
            }
            // Existing pro org, apply credits
            else {
                org = selectedOrg;
                await sdk.forConsole.billing.addCredit(org.$id, couponData.code);
            }

            if (!isOrganization(org) && org.status === 402) {
                let clientSecret = org.clientSecret;
                let params = new URLSearchParams();
                params.append('type', 'payment_confirmed');
                params.append('org', org.teamId);
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
                    '/console/apply-credit?' + params.toString()
                );
                org = await sdk.forConsole.billing.validateOrganization(org.teamId, collaborators);
            }

            if (isOrganization(org)) {
                trackEvent(Submit.CreditRedeem, {
                    coupon: couponData.code,
                    campaign: couponData?.campaign
                });
                await invalidate(Dependencies.ORGANIZATION);
                await goto(`${base}/organization-${org.$id}`);
                addNotification({
                    type: 'success',
                    message: 'Credits applied successfully'
                });
                await invalidate(Dependencies.ACCOUNT);
            }
        } catch (e) {
            trackError(e, Submit.CreditRedeem);
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            isSubmitting.set(false);
        }
    }

    async function addCoupon() {
        try {
            const response = await sdk.forConsole.billing.getCoupon(coupon);
            couponData = response;
            coupon = null;
            addNotification({
                type: 'success',
                message: 'Credits applied successfully'
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    $: selectedOrg = $organizationList?.teams?.find(
        (team) => team.$id === selectedOrgId
    ) as Organization;

    $: billingPlan =
        selectedOrg?.billingPlan === BillingPlan.SCALE
            ? BillingPlan.SCALE
            : (campaign?.plan ?? BillingPlan.PRO);

    $: {
        if (selectedOrgId) {
            (async () => {
                currentPlan = await sdk.forConsole.billing.getOrganizationPlan(selectedOrgId);
            })();
        }
    }
</script>

<svelte:head>
    <title>Apply credits - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer href={previousPage} bind:showExitModal confirmExit>
    <svelte:fragment slot="title">Apply credits</svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
            <FormList>
                {#if $organizationList?.total && !campaign?.onlyNewOrgs && canSelectOrg}
                    <InputSelect
                        bind:value={selectedOrgId}
                        label="Select organization"
                        {options}
                        required
                        placeholder="Select organization"
                        id="organization" />
                {/if}
                {#if selectedOrgId && (selectedOrg?.billingPlan === BillingPlan.FREE || !selectedOrg?.paymentMethodId)}
                    {#if selectedOrgId === newOrgId}
                        <InputText
                            label="Organization name"
                            placeholder="Enter organization name"
                            id="name"
                            required
                            bind:value={name} />
                    {/if}
                    <InputTags
                        bind:tags={collaborators}
                        label="Invite members by email"
                        tooltip="Invited members will have access to all services and payment data within your organization"
                        placeholder="Enter email address(es)"
                        validityRegex={emailRegex}
                        validityMessage="Invalid email address"
                        id="members" />
                    <SelectPaymentMethod bind:methods bind:value={paymentMethodId} bind:taxId />
                {/if}
            </FormList>
        </Form>
        <Form bind:this={couponForm} onSubmit={addCoupon}>
            <FormList>
                {#if !data?.couponData?.code && selectedOrgId}
                    <InputText
                        required
                        disabled={!!couponData?.credits}
                        bind:value={coupon}
                        placeholder="Enter coupon code"
                        id="code"
                        label="Coupon code">
                        <Button submit secondary disabled={!!couponData?.credits}>
                            <span class="text">Apply</span>
                        </Button>
                    </InputText>
                {/if}
            </FormList>
        </Form>
        <svelte:fragment slot="aside">
            {#if campaign?.template === 'card'}
                <div
                    class="box card-container u-position-relative"
                    style:--box-border-radius="var(--border-radius-small)">
                    <div class="card-bg"></div>
                    <div class="u-flex u-flex-vertical u-gap-24 u-cross-center u-position-relative">
                        <img
                            src={getCampaignImageUrl(campaign?.image[$app.themeInUse])}
                            class="u-block u-image-object-fit-cover card-img"
                            alt="promo" />
                        <p class="text">
                            {#if couponData?.credits}
                                {campaign.title.replace('VALUE', couponData.credits.toString())}
                            {:else}
                                {campaign.title}
                            {/if}
                        </p>
                    </div>
                </div>
            {/if}
            {#if selectedOrg?.$id && selectedOrg?.billingPlan !== BillingPlan.FREE && selectedOrg?.billingPlan !== BillingPlan.GITHUB_EDUCATION}
                <section
                    class="card u-margin-block-start-24"
                    style:--p-card-padding="1.5rem"
                    style:--p-card-border-radius="var(--border-radius-small)">
                    {#if couponData?.code && couponData?.status === 'active'}
                        <CreditsApplied bind:couponData fixedCoupon={!!data?.couponData?.code} />
                        <p class="text u-margin-block-start-12">
                            Credits will automatically be applied to your next invoice on <b
                                >{toLocaleDate(selectedOrg?.billingNextInvoiceDate)}.</b>
                        </p>
                    {:else}
                        <p class="text">Add a coupon code to apply credits to your organization.</p>
                    {/if}
                </section>
            {:else if selectedOrgId}
                <div class:u-margin-block-start-24={campaign?.template === 'card'}>
                    <EstimatedTotal
                        {billingBudget}
                        organizationId={selectedOrgId === newOrgId ? undefined : selectedOrgId}
                        {billingPlan}
                        {collaborators}
                        {couponData}>
                        {#if campaign?.template === 'review' && (campaign?.cta || campaign?.claimed || campaign?.unclaimed)}
                            <div class="u-margin-block-end-24">
                                <p class="body-text-1 u-bold">{campaign?.cta}</p>
                                <p class="text u-margin-block-start-8">
                                    {#if couponData?.code && couponData?.status === 'active' && campaign?.claimed}
                                        {campaign?.claimed}
                                    {:else if campaign?.unclaimed}
                                        {campaign?.unclaimed}
                                    {/if}
                                </p>
                            </div>
                        {/if}
                    </EstimatedTotal>
                </div>
            {/if}
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => {
                if (formComponent.checkValidity() && couponForm.checkValidity()) {
                    handleSubmit();
                }
            }}
            disabled={$isSubmitting}>
            {#if $isSubmitting}
                <span class="loader is-small is-transparent u-line-height-1-5" aria-hidden="true" />
            {/if}
            {#if selectedOrgId === newOrgId}
                Create Organization
            {:else}
                Apply credits
            {/if}
        </Button>
    </WizardSecondaryFooter>
    <svelte:fragment slot="exit">
        You can apply your credits to an organization at a later date. All other data entered will
        be lost.
        {#if couponData?.expiration}
            Credits expire {toLocaleDate(couponData.expiration)}.
        {/if}
    </svelte:fragment>
</WizardSecondaryContainer>

<style lang="scss">
    .card-container {
        overflow: hidden;
    }
    .card-bg {
        position: absolute;
        overflow: hidden;
        height: 100%;
        width: 100%;
        inset: 0;
    }
    .card-bg::before {
        position: absolute;
        inset-block-start: -30px;
        inset-inline-end: -30px;
        content: '';
        display: block;
        inline-size: 30%;
        block-size: 30%;
        background: radial-gradient(49.55% 43.54% at 47% 50.69%, #e7f8f7 0%, #85dbd8 100%);
        filter: blur(70px);
    }
    .card-bg::after {
        position: absolute;
        inset-block-end: -30px;
        inset-inline-start: -30px;
        content: '';
        display: block;
        inline-size: 30%;
        block-size: 30%;
        background: radial-gradient(50% 46.73% at 50% 53.27%, #fe9567 28.17%, #fd366e 59.38%);
        filter: blur(70px);
    }
    .card-img {
        max-width: 12.5rem;
    }
</style>
