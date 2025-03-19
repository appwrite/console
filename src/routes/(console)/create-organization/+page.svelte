<script lang="ts">
    import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        EstimatedTotalBox,
        PlanComparisonBox,
        PlanSelection,
        SelectPaymentMethod
    } from '$lib/components/billing';
    import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, InputTags, InputText } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import type { Coupon } from '$lib/sdk/billing';
    import { tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Fieldset, Icon, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';

    export let data;

    let selectedPlan: BillingPlan = data.plan as BillingPlan;
    let selectedCoupon: Partial<Coupon> | null = data.coupon;
    let previousPage: string = base;
    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);
    let name: string;
    let paymentMethodId: string =
        data.paymentMethods.paymentMethods.find((method) => !!method?.last4)?.$id ?? null;
    let collaborators: string[] = [];
    let taxId: string;
    let billingBudget: number;
    let showCreditModal = false;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    async function create() {
        try {
            let org: Organization;

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
                    null
                );

                //Add budget
                if (billingBudget) {
                    await sdk.forConsole.billing.updateBudget(org.$id, billingBudget, [75]);
                }

                //Add coupon
                if (selectedCoupon?.code) {
                    await sdk.forConsole.billing.addCredit(org.$id, selectedCoupon.code);
                    trackEvent(Submit.CreditRedeem);
                }

                //Add collaborators
                if (collaborators?.length) {
                    collaborators.forEach(async (collaborator) => {
                        await sdk.forConsole.teams.createMembership(
                            org.$id,
                            ['developer'],
                            collaborator,
                            undefined,
                            undefined,
                            `${$page.url.origin}${base}/invite`
                        );
                    });
                }

                // Add tax ID
                if (taxId) {
                    await sdk.forConsole.billing.updateTaxId(org.$id, taxId);
                }
            }

            trackEvent(Submit.OrganizationCreate, {
                plan: tierToPlan(selectedPlan)?.name,
                budget_cap_enabled: !!billingBudget,
                members_invited: collaborators?.length
            });

            await invalidate(Dependencies.ACCOUNT);
            await preloadData(`${base}/organization-${org.$id}`);
            await goto(`${base}/organization-${org.$id}`);
            addNotification({
                type: 'success',
                message: `${name ?? 'Organization'} has been created`
            });
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
            {#if selectedPlan !== BillingPlan.FREE}
                <SelectPaymentMethod
                    methods={data.paymentMethods}
                    bind:value={paymentMethodId}
                    bind:taxId />
                <Fieldset legend="Invite members">
                    <InputTags
                        bind:tags={collaborators}
                        label="Invite members by email"
                        placeholder="Enter email address(es)"
                        id="members" />
                </Fieldset>
                {#if !selectedCoupon?.code}
                    <Button text on:click={() => (showCreditModal = true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add credits
                    </Button>
                {/if}
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        {#if selectedPlan !== BillingPlan.FREE}
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
