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
    let options = [
        ...$organizationList?.teams?.map((team) => ({
            value: team.$id,
            label: team.name
        })),
        {
            value: null,
            label: 'Create new organization'
        }
    ];
    let name: string;

    onMount(async () => {
        await loadPaymentMethods();
        if (!$organizationList?.total) {
            selectedOrgId = null;
        } else {
            selectedOrgId = $organizationList?.teams[0]?.$id;
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
                    ID.unique(),
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
    <WizardSecondaryHeader href={previousPage}>Apply credits</WizardSecondaryHeader>
    <WizardSecondaryContent>
        {#if $organizationList?.total}
            <FormList>
                <InputSelect
                    bind:value={selectedOrgId}
                    label="Select organization"
                    {options}
                    required
                    placeholder="Create new organization"
                    id="organization" />
            </FormList>
        {/if}
        {#if selectedOrg?.billingPlan !== BillingPlan.PRO || !selectedOrg?.paymentMethodId}
            <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
                <FormList>
                    {#if !selectedOrgId}
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
            <div class="card card-bg">
                <img
                    src={`/images/campaigns/${data.couponData.campaign}/${$app.themeInUse}.png`}
                    class="u-block u-image-object-fit-cover"
                    alt="promo" />
            </div>
            {#if selectedOrg?.billingPlan === BillingPlan.PRO}
                <section class="card u-margin-block-start-32">
                    <p class="text">
                        Credits will automatically be applied to your next invoice on <b
                            >{toLocaleDate(selectedOrg.billingNextInvoiceDate)}.</b>
                    </p>
                </section>
            {:else if selectedOrg?.$id}
                <EstimatedTotalBox
                    billingPlan={BillingPlan.PRO}
                    {collaborators}
                    bind:couponData={data.couponData}
                    bind:billingBudget />
            {/if}
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile href={`${base}/console`} secondary>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting || isButtonDisabled}>
            Apply credits
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>

<style lang="scss">
    .card-bg {
        position: relative;
        overflow: hidden;
        & > img {
            z-index: 10;
        }
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
        filter: blur(50px);
        z-index: 1;
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
        filter: blur(50px);
    }
</style>
