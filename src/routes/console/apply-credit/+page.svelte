<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { EstimatedTotalBox, SelectPaymentMethod } from '$lib/components/billing';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputSelect, InputTags, InputText } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter,
        WizardSecondaryHeader
    } from '$lib/layout';
    import { type PaymentList } from '$lib/sdk/billing';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export let data;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/i;
    let previousPage: string = `${base}/console`;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    let selectedOrgId: string = null;
    let formComponent: Form;
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

    onMount(async () => {
        await loadPaymentMethods();
        if (!$organizationList?.total) {
            selectedOrgId = newOrgId;
        }
    });

    async function loadPaymentMethods() {
        methods = await sdk.forConsole.billing.listPaymentMethods();

        paymentMethodId =
            selectedOrg?.paymentMethodId ??
            methods.paymentMethods.find((method) => !!method?.last4)?.$id ??
            null;
    }

    async function handleSubmit() {
        try {
            let org: Organization;
            // Create new org
            if (!selectedOrgId) {
                org = await sdk.forConsole.billing.createOrganization(
                    newOrgId,
                    name,
                    BillingPlan.PRO,
                    paymentMethodId
                );
            }
            // Upgrade existing org
            else if (selectedOrg?.billingPlan !== BillingPlan.PRO) {
                org = await sdk.forConsole.billing.updatePlan(
                    selectedOrg.$id,
                    BillingPlan.PRO,
                    paymentMethodId,
                    null
                );
            }
            // Existing pro org
            else {
                org = selectedOrg;
            }

            // Add coupon
            if (data.couponData?.code) {
                await sdk.forConsole.billing.addCredit(org.$id, data.couponData.code);
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
                        `${$page.url.origin}/console/organization-${org.$id}`
                    );
                });
            }

            // Add tax ID
            if (taxId) {
                await sdk.forConsole.billing.updateTaxId(org.$id, taxId);
            }

            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);

            await goto(`/console/organization-${org.$id}`);

            addNotification({
                type: 'success',
                message: 'Credits applied successfully'
            });
            trackEvent(Submit.CreditRedeem);
        } catch (e) {
            trackError(e, Submit.CreditRedeem);
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    $: selectedOrg = $organizationList?.teams?.find(
        (team) => team.$id === selectedOrgId
    ) as Organization;

    $: isButtonDisabled = selectedOrgId
        ? !selectedOrg?.paymentMethodId && !paymentMethodId
        : !name || !paymentMethodId;
</script>

<svelte:head>
    <title>Apply credits - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer>
    <WizardSecondaryHeader confirmExit href={previousPage}
        >Apply credits
        <svelte:fragment slot="exit">
            You can apply your credits to an organization at a later date. All other data entered
            will be lost. Credits expire {toLocaleDate(data.couponData.expiration)}.
        </svelte:fragment>
    </WizardSecondaryHeader>
    <WizardSecondaryContent>
        {#if $organizationList?.total}
            <FormList>
                <InputSelect
                    bind:value={selectedOrgId}
                    label="Select organization"
                    {options}
                    required
                    placeholder="Select organization"
                    id="organization" />
            </FormList>
        {/if}
        {#if selectedOrgId && (selectedOrg?.billingPlan !== BillingPlan.PRO || !selectedOrg?.paymentMethodId)}
            <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
                <FormList>
                    {#if selectedOrgId === newOrgId}
                        <InputText
                            label="Name"
                            id="name"
                            placeholder="Organization name"
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
                </FormList>
            </Form>
        {/if}
        <svelte:fragment slot="aside">
            <div
                class="box card-container u-position-relative"
                style:--box-border-radius="var(--border-radius-large)">
                <div class="card-bg"></div>
                <div
                    class="u-flex u-flex-vertical u-gap-24 u-cross-center u-position-relative"
                    style:z-index={10}>
                    <img
                        src={`/images/campaigns/${data.couponData.campaign}/${$app.themeInUse}.png`}
                        class="u-block u-image-object-fit-cover card-img"
                        alt="promo" />
                    <p class="text">
                        {data.campaign.title.replace('VALUE', data.couponData.credits)}
                    </p>
                </div>
            </div>
            {#if selectedOrg?.billingPlan === BillingPlan.PRO}
                <section class="card u-margin-block-start-24" style:--p-card-padding="1.5rem">
                    <p class="text">
                        Credits will automatically be applied to your next invoice on <b
                            >{toLocaleDate(selectedOrg.billingNextInvoiceDate)}.</b>
                    </p>
                </section>
            {:else if selectedOrgId}
                <EstimatedTotalBox
                    fixedCoupon
                    billingPlan={BillingPlan.PRO}
                    {collaborators}
                    bind:couponData={data.couponData}
                    bind:billingBudget />
            {/if}
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile href={previousPage} secondary>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting || isButtonDisabled}>
            Apply credits
        </Button>
    </WizardSecondaryFooter>
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
