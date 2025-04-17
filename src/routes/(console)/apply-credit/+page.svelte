<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        CreditsApplied,
        EstimatedTotalBox,
        SelectPaymentMethod
    } from '$lib/components/billing';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputTags, InputText } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Wizard } from '$lib/layout';
    import { type PaymentList } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { plansInfo, type Tier } from '$lib/stores/billing';
    import { Fieldset, Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

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
    let billingPlan: Tier = BillingPlan.PRO;
    let tempOrgId = null;

    $: onlyNewOrgs = (campaign && campaign.onlyNewOrgs) || (couponData && couponData.onlyNewOrgs);

    $: selectedOrgId = tempOrgId;

    onMount(async () => {
        await loadPaymentMethods();
        if (!$organizationList?.total || campaign?.onlyNewOrgs) {
            selectedOrgId = newOrgId;
        }
        if (page.url.searchParams.has('org')) {
            selectedOrgId = page.url.searchParams.get('org');
            canSelectOrg = false;
        }
        if (campaign?.plan) {
            billingPlan = campaign.plan;
        }

        if ($organizationList.total > 0 && tempOrgId === null) {
            tempOrgId = $organizationList.teams[0].$id;
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
        try {
            let org: Organization;
            // Create new org
            if (selectedOrgId === newOrgId) {
                org = await sdk.forConsole.billing.createOrganization(
                    newOrgId,
                    name,
                    billingPlan,
                    paymentMethodId
                );
            }
            // Upgrade existing org
            else if (selectedOrg?.billingPlan !== billingPlan) {
                org = await sdk.forConsole.billing.updatePlan(
                    selectedOrg.$id,
                    billingPlan,
                    paymentMethodId,
                    null
                );
            }
            // Existing pro org
            else {
                org = selectedOrg;
            }

            // Add coupon
            if (couponData?.code) {
                await sdk.forConsole.billing.addCredit(org.$id, couponData.code);
            }

            // Add budget
            if (billingBudget) {
                await sdk.forConsole.billing.updateBudget(org.$id, billingBudget, [75]);
            }

            // Add collaborators
            if (collaborators?.length) {
                collaborators.forEach(async (collaborator) => {
                    await sdk.forConsole.teams.createMembership(
                        org.$id,
                        ['owner'],
                        collaborator,
                        undefined,
                        undefined,
                        `${page.url.origin}${base}/invite`
                    );
                });
            }

            // Add tax ID
            if (taxId) {
                await sdk.forConsole.billing.updateTaxId(org.$id, taxId);
            }
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
        } catch (e) {
            trackError(e, Submit.CreditRedeem);
            addNotification({
                type: 'error',
                message: e.message
            });
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

    function getBillingPlan(): Tier | undefined {
        const campaignPlan =
            campaign?.plan && $plansInfo.get(campaign.plan) ? $plansInfo.get(campaign.plan) : null;
        const orgPlan =
            selectedOrg?.billingPlan && $plansInfo.get(selectedOrg.billingPlan)
                ? $plansInfo.get(selectedOrg.billingPlan)
                : null;

        if (!campaignPlan || !orgPlan) {
            return;
        }

        return campaignPlan.order > orgPlan.order ? campaign.plan : selectedOrg?.billingPlan;
    }

    $: if (selectedOrg) {
        billingPlan = getBillingPlan();
    }
</script>

<svelte:head>
    <title>Apply credits - Appwrite</title>
</svelte:head>

<Wizard bind:showExitModal href={previousPage} confirmExit title="Apply credits">
    <Layout.Stack gap="l">
        <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
            <Layout.Stack gap="xl">
                <Fieldset legend="Setup">
                    <Layout.Stack gap="l">
                        {#if $organizationList?.total && !onlyNewOrgs && canSelectOrg}
                            <InputSelect
                                bind:value={selectedOrgId}
                                label="Organization"
                                {options}
                                required
                                placeholder="Select organization"
                                id="organization" />
                        {/if}
                        {#if selectedOrgId && (selectedOrg?.billingPlan !== BillingPlan.PRO || !selectedOrg?.paymentMethodId)}
                            {#if selectedOrgId === newOrgId}
                                <InputText
                                    label="Organization name"
                                    placeholder="Enter name"
                                    id="name"
                                    required
                                    bind:value={name} />
                            {/if}
                            <InputTags
                                bind:tags={collaborators}
                                label="Invite members by email"
                                placeholder="Enter email address(es)"
                                pattern={emailRegex.toString()}
                                id="members">
                                <Tooltip slot="info">
                                    <Icon icon={IconInfo} size="s" />
                                    <span slot="tooltip">
                                        Invited members will have access to all services and payment
                                        data within your organization
                                    </span>
                                </Tooltip>
                            </InputTags>
                        {/if}
                    </Layout.Stack>
                </Fieldset>
                {#if (selectedOrgId && (selectedOrg?.billingPlan !== BillingPlan.PRO || !selectedOrg?.paymentMethodId)) || (!data?.couponData?.code && selectedOrgId)}
                    <Fieldset legend="Payment">
                        <Layout.Stack gap="xl">
                            {#if selectedOrgId && (selectedOrg?.billingPlan !== BillingPlan.PRO || !selectedOrg?.paymentMethodId)}
                                <SelectPaymentMethod
                                    bind:methods
                                    bind:value={paymentMethodId}
                                    bind:taxId />
                            {/if}
                            <Form bind:this={couponForm} onSubmit={addCoupon}>
                                {#if !data?.couponData?.code && selectedOrgId}
                                    <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                        <InputText
                                            required
                                            disabled={!!couponData?.credits}
                                            bind:value={coupon}
                                            placeholder="Enter code"
                                            id="code"
                                            label="Coupon code">
                                        </InputText>

                                        <Button
                                            submit
                                            secondary
                                            size="s"
                                            disabled={!!couponData?.credits}>
                                            <span class="text">Add</span>
                                        </Button>
                                    </Layout.Stack>
                                {/if}
                            </Form>
                        </Layout.Stack>
                    </Fieldset>
                {/if}
            </Layout.Stack>
        </Form>
    </Layout.Stack>
    <svelte:fragment slot="aside">
        {#if selectedOrg?.$id && selectedOrg?.billingPlan === billingPlan}
            <section
                class="card"
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
            <div>
                <EstimatedTotalBox
                    fixedCoupon={!!data?.couponData?.code}
                    {billingPlan}
                    {collaborators}
                    plans={$plansInfo}
                    bind:couponData
                    bind:billingBudget>
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
                </EstimatedTotalBox>
            </div>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="footer">
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
                <span class="loader is-small is-transparent u-line-height-1-5" aria-hidden="true"
                ></span>
            {/if}
            {#if selectedOrgId === newOrgId}
                Create organization
            {:else}
                Apply
            {/if}
        </Button>
    </svelte:fragment>
    <svelte:fragment slot="exit">
        You can apply your credits to an organization at a later date. All other data entered will
        be lost.
        {#if couponData?.expiration}
            Credits expire {toLocaleDate(couponData.expiration)}.
        {/if}
    </svelte:fragment>
</Wizard>
