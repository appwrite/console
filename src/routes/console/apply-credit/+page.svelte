<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { EstimatedTotalBox, SelectPaymentMethod } from '$lib/components/billing';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputSelect, InputTags } from '$lib/elements/forms';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter,
        WizardSecondaryHeader
    } from '$lib/layout';
    import { type PaymentList } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
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

    onMount(async () => {
        await loadPaymentMethods();
        if ($organizationList?.total === 1) {
            selectedOrgId = $organizationList?.teams[0]?.$id;
        } else if (!$organizationList?.total) {
            selectedOrgId = null;
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
            const org = await sdk.forConsole.billing.updatePlan(
                selectedOrg.$id,
                BillingPlan.PRO,
                paymentMethodId,
                null
            );

            //Add coupon
            if (data.couponData?.code) {
                await sdk.forConsole.billing.addCredit(org.$id, data.couponData.code);
            }

            //Add budget
            if (billingBudget) {
                await sdk.forConsole.billing.updateBudget(org.$id, billingBudget, [75]);
            }

            //Add collaborators
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

            //Add tax ID
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
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.CreditRedeem);
        }
    }

    $: selectedOrg = $organizationList?.teams?.find(
        (team) => team.$id === selectedOrgId
    ) as Organization;

    $: isButtonDisabled =
        selectedOrg?.paymentMethodId && selectedOrg?.billingPlan === BillingPlan.PRO;
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
                    placeholder="Select organization"
                    id="organization" />
            </FormList>
        {/if}
        {#if selectedOrg?.billingPlan !== BillingPlan.PRO || !selectedOrg?.paymentMethodId}
            <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
                <FormList>
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
            <div class="card">
                <img src="/images/3D-card-illust-light.png" alt="" />
            </div>
            <EstimatedTotalBox
                bind:billingPlan={selectedOrg.billingPlan}
                {collaborators}
                bind:couponData={data.couponData}
                bind:billingBudget />
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
