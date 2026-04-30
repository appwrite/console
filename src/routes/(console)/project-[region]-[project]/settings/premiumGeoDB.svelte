<script lang="ts">
    import { Box, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { getChangePlanUrl, plansInfo } from '$lib/stores/billing';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { page } from '$app/state';
    import { get } from 'svelte/store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { Badge } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import PremiumGeoDBEnableModal from './premiumGeoDBEnableModal.svelte';
    import PremiumGeoDBDisableModal from './premiumGeoDBDisableModal.svelte';

    export let addons: Models.AddonList | null = null;
    export let addonPrice: Models.AddonPrice | null = null;

    let showEnable = false;
    let showDisable = false;
    let reEnabling = false;
    let cancelling = false;

    $: planSupportsPremiumGeoDB = $currentPlan?.supportedAddons?.premiumGeoDB === true;
    $: canUpgradeToPremiumGeoDB =
        !planSupportsPremiumGeoDB && hasUpgradeablePlanWithPremiumGeoDB($currentPlan);
    $: premiumGeoDBAddon = addons?.addons?.find(
        (a) => a.key === 'premiumGeoDB' && (a.status === 'active' || a.status === 'pending')
    );
    $: isPending = premiumGeoDBAddon?.status === 'pending';
    $: isActive = premiumGeoDBAddon?.status === 'active';
    $: isScheduledForRemoval = isActive && premiumGeoDBAddon?.nextValue === 0;
    $: monthlyPriceLabel = addonPrice ? formatCurrency(addonPrice.monthlyPrice) : null;

    function hasUpgradeablePlanWithPremiumGeoDB(plan: Models.BillingPlan): boolean {
        if (!plan) return false;
        const plans = get(plansInfo);
        for (const [, p] of plans) {
            if (p.order > plan.order && p.supportedAddons?.premiumGeoDB) {
                return true;
            }
        }
        return false;
    }

    async function handleCancelAndRetry() {
        cancelling = true;
        try {
            await sdk.forConsoleIn(page.params.region).projects.deleteAddon({
                projectId: page.params.project,
                addonId: premiumGeoDBAddon.$id
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
            await sdk.forConsoleIn(page.params.region).projects.createPremiumGeoDBAddon({
                projectId: page.params.project
            });
            await Promise.all([invalidate(Dependencies.ADDONS), invalidate(Dependencies.PROJECT)]);
            addNotification({
                message: 'Premium Geo DB addon has been re-enabled',
                type: 'success'
            });
        } catch (e) {
            addNotification({
                message: e.message,
                type: 'error'
            });
        } finally {
            reEnabling = false;
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Premium Geo DB</svelte:fragment>
    Enrich session and request data with premium geolocation details such as timezone, postal code, ISP,
    connection type, and organization. Useful for fine-grained analytics, fraud detection, and personalized
    user experiences.
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>Premium Geo DB</b>
            </h6>
            {#if !planSupportsPremiumGeoDB && canUpgradeToPremiumGeoDB}
                <p class="text u-margin-block-start-8">
                    Premium Geo DB is not available on your current plan. Upgrade your plan to
                    enable it.
                </p>
                <Button
                    secondary
                    class="u-margin-block-start-16"
                    href={getChangePlanUrl($organization?.$id)}>
                    <span class="text">Upgrade plan</span>
                </Button>
            {:else if !planSupportsPremiumGeoDB}
                <p class="text u-margin-block-start-8">
                    Premium Geo DB is not available on your current plan.
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
                    {#if monthlyPriceLabel}
                        Premium Geo DB is enabled for this project at {monthlyPriceLabel}/month.
                    {:else}
                        Premium Geo DB is enabled for this project.
                    {/if}
                </p>
                {#if isScheduledForRemoval}
                    <p class="text u-margin-block-start-8">
                        Premium Geo DB will be removed at the end of your current billing cycle.
                    </p>
                    <Button
                        secondary
                        class="u-margin-block-start-16"
                        disabled={reEnabling}
                        on:click={handleReEnable}>
                        <span class="text">Keep Premium Geo DB</span>
                    </Button>
                {:else}
                    <Button
                        secondary
                        class="u-margin-block-start-16"
                        on:click={() => (showDisable = true)}>
                        <span class="text">Disable Premium Geo DB</span>
                    </Button>
                {/if}
            {:else}
                <p class="text u-margin-block-start-8">
                    Enable Premium Geo DB for this project to collect detailed geolocation data on
                    every request.{#if monthlyPriceLabel}
                        This addon costs {monthlyPriceLabel}/month, prorated for your current
                        billing cycle.
                    {:else}
                        Billed prorated for your current cycle.
                    {/if}
                </p>
                <Button
                    secondary
                    class="u-margin-block-start-16"
                    on:click={() => (showEnable = true)}>
                    <span class="text">Enable Premium Geo DB</span>
                </Button>
            {/if}
        </Box>
    </svelte:fragment>
</CardGrid>

<PremiumGeoDBEnableModal bind:show={showEnable} {addonPrice} />

{#if premiumGeoDBAddon}
    <PremiumGeoDBDisableModal bind:show={showDisable} addonId={premiumGeoDBAddon.$id} />
{/if}
