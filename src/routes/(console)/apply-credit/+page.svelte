<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button, Form, FormList, InputSelect } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';

    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { CreditsApplied } from '$lib/components/billing';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Helper } from '$lib/elements/forms/index.js';

    export let data;

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
    let isSubmitting = writable(false);
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

    let couponData = data?.couponData;
    let campaign = data?.campaign;
    $: selectedAction = selectedOrgId === newOrgId ? 'create' : 'update';

    onMount(async () => {
        if (!$organizationList?.total || campaign?.onlyNewOrgs) {
            selectedOrgId = newOrgId;
        }
        if ($page.url.searchParams.has('org')) {
            selectedOrgId = $page.url.searchParams.get('org');
            canSelectOrg = false;
        }
    });

    async function applyCouponCredit(org: Organization) {
        $isSubmitting = true;
        let error = null;

        try {
            await sdk.forConsole.billing.addCredit(org.$id, couponData.code);
            trackEvent(Submit.CreditRedeem);
        } catch (e) {
            error = e;
            $isSubmitting = false;
            trackError(error, Submit.CreditRedeem);
        }

        addNotification({
            type: error ? 'error' : 'success',
            message: error ? error.message : 'Credit applied successfully'
        });

        if (!error) {
            await goto(`${base}/organization-${selectedOrgId}`);
        }
    }

    async function handleSubmit() {
        if (couponData) {
            const createOrganization = selectedAction === 'create';
            const isScalePlanUpgrade =
                campaign?.plan && selectedOrg?.billingPlan !== campaign?.plan;

            // on create-org, its `coupon`
            if (createOrganization) {
                await goto(`${base}/create-organization?coupon=${couponData.code}`);
                return;
            }
            if (!campaign?.plan || campaign.plan === selectedOrg?.billingPlan) {
                await applyCouponCredit(selectedOrg);
            } else if (isScalePlanUpgrade) {
                await goto(
                    `${base}/create-organization?coupon=${couponData.code}&plan=${campaign.plan}`
                );
            } else if (selectedAction === 'update') {
                // on change-plan, its `code`
                await goto(
                    `${base}/organization-${selectedOrgId}/change-plan?code=${couponData.code}`
                );
            }
        } else {
            // we might not reach here but still, just being safe.
            addNotification({
                type: 'error',
                message: 'Coupon code is not valid'
            });
        }
    }

    $: selectedOrg = $organizationList?.teams?.find(
        (team) => team.$id === selectedOrgId
    ) as Organization;
</script>

<svelte:head>
    <title>Apply credits - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer href={previousPage} bind:showExitModal confirmExit>
    <svelte:fragment slot="title">Apply credits</svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
            <FormList gap={8}>
                {#if $organizationList?.total && !campaign?.onlyNewOrgs && canSelectOrg}
                    <InputSelect
                        bind:value={selectedOrgId}
                        label="Select organization"
                        {options}
                        required
                        placeholder="Select organization"
                        id="organization" />
                {/if}

                {#if campaign?.plan && selectedOrg && selectedOrg.billingPlan !== campaign?.plan}
                    <Helper type="neutral">
                        This coupon code is only valid when upgrading to Scale plan.
                    </Helper>
                {/if}
            </FormList>
        </Form>

        <!-- this is the side card and is okay -->
        <svelte:fragment slot="aside">
            {#if campaign?.template === 'card'}
                <div
                    class="box card-container u-position-relative"
                    style:--box-border-radius="var(--border-radius-small)">
                    <div class="card-bg"></div>
                    <div class="u-flex u-flex-vertical u-gap-24 u-cross-center u-position-relative">
                        <img
                            src={campaign?.image[$app.themeInUse]}
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

            <section
                class="card u-margin-block-start-24"
                style:--p-card-padding="1.5rem"
                style:--p-card-border-radius="var(--border-radius-small)">
                {#if couponData?.code && couponData?.status === 'active'}
                    {@const dateAvailable = selectedOrg?.billingNextInvoiceDate}
                    <CreditsApplied bind:couponData fixedCoupon={!!data?.couponData?.code} />
                    <p class="text u-margin-block-start-12">
                        {#if !dateAvailable}
                            Credits will automatically be applied to your next invoice.
                        {:else}
                            Credits will automatically be applied to your next invoice on <b
                                >{toLocaleDate(selectedOrg?.billingNextInvoiceDate)}</b
                            >.
                        {/if}
                    </p>
                {:else}
                    <p class="text">Add a coupon code to apply credits to your organization.</p>
                {/if}
            </section>
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => {
                if (formComponent.checkValidity()) {
                    handleSubmit();
                }
            }}
            disabled={$isSubmitting || !selectedOrgId}>
            {#if $isSubmitting}
                <span class="loader is-small is-transparent u-line-height-1-5" aria-hidden="true" />
            {/if}
            {#if selectedOrgId === newOrgId}
                Create organization
            {:else if campaign?.plan && selectedOrg && selectedOrg.billingPlan !== campaign?.plan}
                Upgrade plan
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
