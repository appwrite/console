<script lang="ts">
    import { Box, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { getChangePlanUrl, plansInfo } from '$lib/stores/billing';
    import { currentPlan } from '$lib/stores/organization';
    import { organization } from '$lib/stores/organization';
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';
    import { goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { Badge } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import BAAEnableModal from './BAAEnableModal.svelte';
    import BAADisableModal from './BAADisableModal.svelte';

    export let addons: Models.AddonList | null = null;
    export let addonPrice: Models.AddonPrice | null = null;

    let showEnable = false;
    let showDisable = false;
    let reEnabling = false;
    let cancelling = false;

    $: planSupportsBaa = $currentPlan?.supportedAddons?.baa === true;
    $: canUpgradeToBaa = !planSupportsBaa && hasUpgradeablePlanWithBaa($currentPlan);
    $: baaAddon = addons?.addons?.find(
        (a) => a.key === 'baa' && (a.status === 'active' || a.status === 'pending')
    );
    $: isPending = baaAddon?.status === 'pending';
    $: isActive = baaAddon?.status === 'active';
    $: isScheduledForRemoval = isActive && baaAddon?.nextValue === 0;
    $: monthlyPriceLabel = addonPrice ? formatCurrency(addonPrice.monthlyPrice) : '$350';

    onMount(async () => {
        if (page.url.searchParams.get('type') === 'confirm-addon') {
            let addonId = page.url.searchParams.get('addonId');

            // Fall back to listing addons if addonId is missing or invalid
            let lookupFailed = false;
            if (!addonId || addonId === 'undefined') {
                try {
                    const addonList = await sdk.forConsole.organizations.listAddons({
                        organizationId: $organization.$id
                    });
                    const pending = addonList.addons.find(
                        (a) => a.key === 'baa' && a.status === 'pending'
                    );
                    addonId = pending?.$id ?? null;
                } catch (e) {
                    lookupFailed = true;
                    addNotification({
                        message: e?.message ?? 'Unable to verify BAA addon status. Please retry.',
                        type: 'error'
                    });
                }
            }

            if (lookupFailed) {
                const settingsUrl = resolve('/(console)/organization-[organization]/settings', {
                    organization: $organization.$id
                });
                await goto(settingsUrl, { replaceState: true });
                return;
            }

            if (addonId) {
                try {
                    await sdk.forConsole.organizations.confirmAddonPayment({
                        organizationId: $organization.$id,
                        addonId
                    });
                    await Promise.all([
                        invalidate(Dependencies.ADDONS),
                        invalidate(Dependencies.ORGANIZATION)
                    ]);
                    addNotification({
                        message: 'BAA addon has been enabled',
                        type: 'success'
                    });
                } catch (e) {
                    // If addon not found, payment webhook may have already activated it
                    if (e?.type === 'addon_not_found' || e?.code === 404) {
                        await Promise.all([
                            invalidate(Dependencies.ADDONS),
                            invalidate(Dependencies.ORGANIZATION)
                        ]);
                        addNotification({
                            message: 'BAA addon has been enabled',
                            type: 'success'
                        });
                    } else {
                        addNotification({
                            message: e.message,
                            type: 'error'
                        });
                    }
                }
            } else {
                addNotification({
                    message:
                        'Could not verify BAA payment. Please check your BAA status or contact support.',
                    type: 'error'
                });
            }

            const settingsUrl = resolve('/(console)/organization-[organization]/settings', {
                organization: $organization.$id
            });
            await goto(settingsUrl, { replaceState: true });
        }
    });

    function hasUpgradeablePlanWithBaa(plan: Models.BillingPlan): boolean {
        if (!plan) return false;
        const plans = get(plansInfo);
        for (const [, p] of plans) {
            if (p.order > plan.order && p.supportedAddons?.baa) {
                return true;
            }
        }
        return false;
    }

    async function handleCancelAndRetry() {
        cancelling = true;
        try {
            await sdk.forConsole.organizations.deleteAddon({
                organizationId: $organization.$id,
                addonId: baaAddon.$id
            });
            await invalidate(Dependencies.ADDONS);
            showEnable = true;
        } catch (e) {
            addNotification({
                message: e.message,
                type: 'error'
            });
        } finally {
            cancelling = false;
        }
    }

    async function handleReEnable() {
        reEnabling = true;
        try {
            const result: Models.Addon | Models.PaymentAuthentication =
                await sdk.forConsole.organizations.createBaaAddon({
                    organizationId: $organization.$id
                });

            if ('clientSecret' in result) {
                const paymentAuth = result as unknown as Models.PaymentAuthentication;
                const settingsUrl = resolve('/(console)/organization-[organization]/settings', {
                    organization: $organization.$id
                });
                await confirmPayment({
                    clientSecret: paymentAuth.clientSecret,
                    paymentMethodId: $organization.paymentMethodId,
                    orgId: $organization.$id,
                    route: `${settingsUrl}?type=confirm-addon&addonId=${paymentAuth.addonId}`
                });
                return;
            }

            await Promise.all([
                invalidate(Dependencies.ADDONS),
                invalidate(Dependencies.ORGANIZATION)
            ]);
            addNotification({
                message: 'BAA addon has been re-enabled',
                type: 'success'
            });
            trackEvent(Submit.BAAAddonEnable);
        } catch (e) {
            addNotification({
                message: e.message,
                type: 'error'
            });
            trackError(e, Submit.BAAAddonEnable);
        } finally {
            reEnabling = false;
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">BAA</svelte:fragment>
    A Business Associate Agreement (BAA) is a HIPAA-required document ensuring outside services handling
    patient information for a healthcare organization follow privacy rules.
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>Business Associate Agreement (BAA)</b>
            </h6>
            {#if !planSupportsBaa && canUpgradeToBaa}
                <p class="text u-margin-block-start-8">
                    BAA is not available on your current plan. Upgrade your plan to enable BAA for
                    your organization.
                </p>
                <Button
                    secondary
                    class="u-margin-block-start-16"
                    href={getChangePlanUrl($organization?.$id)}>
                    <span class="text">Upgrade plan</span>
                </Button>
            {:else if !planSupportsBaa}
                <p class="text u-margin-block-start-8">
                    BAA is not available on your current plan.
                </p>
            {:else if isPending}
                <div class="u-flex u-cross-center u-gap-8 u-margin-block-start-8">
                    <Badge variant="secondary" type="warning" content="Payment pending" />
                </div>
                <p class="text u-margin-block-start-8">
                    A payment is awaiting confirmation. If the payment was interrupted, you can
                    cancel and retry.
                </p>
                <Button
                    secondary
                    class="u-margin-block-start-16"
                    disabled={cancelling}
                    on:click={handleCancelAndRetry}>
                    <span class="text">Cancel & retry</span>
                </Button>
            {:else if isActive}
                <div class="u-flex u-cross-center u-gap-8 u-margin-block-start-8">
                    {#if isScheduledForRemoval}
                        <Badge variant="secondary" type="warning" content="Scheduled for removal" />
                    {:else}
                        <Badge variant="secondary" type="success" content="Active" />
                    {/if}
                </div>
                <p class="text u-margin-block-start-8">
                    BAA is enabled for your organization at {monthlyPriceLabel}/month.
                </p>
                {#if isScheduledForRemoval}
                    <p class="text u-margin-block-start-8">
                        BAA will be removed at the end of your current billing cycle.
                    </p>
                    <Button
                        secondary
                        class="u-margin-block-start-16"
                        disabled={reEnabling}
                        on:click={handleReEnable}>
                        <span class="text">Keep BAA</span>
                    </Button>
                {:else}
                    <Button
                        secondary
                        class="u-margin-block-start-16"
                        on:click={() => (showDisable = true)}>
                        <span class="text">Disable BAA</span>
                    </Button>
                {/if}
            {:else}
                <p class="text u-margin-block-start-8">
                    Enable BAA for your organization to ensure HIPAA compliance. This addon costs
                    {monthlyPriceLabel}/month, prorated for your current billing cycle.
                </p>
                <Button
                    secondary
                    class="u-margin-block-start-16"
                    on:click={() => (showEnable = true)}>
                    <span class="text">Enable BAA</span>
                </Button>
            {/if}
        </Box>
    </svelte:fragment>
</CardGrid>

<BAAEnableModal bind:show={showEnable} {addonPrice} />

{#if baaAddon}
    <BAADisableModal bind:show={showDisable} addonId={baaAddon.$id} />
{/if}
