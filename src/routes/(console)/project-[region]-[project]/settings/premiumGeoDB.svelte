<script lang="ts">
    import { onMount } from 'svelte';
    import { Box, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { getChangePlanUrl, plansInfo } from '$lib/stores/billing';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { page } from '$app/state';
    import { get } from 'svelte/store';
    import { goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { confirmPayment } from '$lib/stores/stripe';
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
    let refreshing = false;

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

    onMount(async () => {
        if (page.url.searchParams.get('type') === 'confirm-addon') {
            let addonId = page.url.searchParams.get('addonId');

            // Fall back to listing pending addons if addonId is missing
            if (!addonId || addonId === 'undefined') {
                try {
                    const addonList = await sdk
                        .forConsoleIn(page.params.region)
                        .projects.listAddons({ projectId: page.params.project });
                    const pending = addonList.addons.find(
                        (a) => a.key === 'premiumGeoDB' && a.status === 'pending'
                    );
                    addonId = pending?.$id ?? null;
                } catch (e) {
                    addNotification({
                        message:
                            e?.message ??
                            'Unable to verify Premium Geo DB addon status. Please retry.',
                        type: 'error'
                    });
                    addonId = null;
                }
            }

            if (addonId) {
                await confirmAddon(addonId);
            }

            const settingsUrl = resolve('/(console)/project-[region]-[project]/settings', {
                region: page.params.region,
                project: page.params.project
            });
            await goto(settingsUrl, { replaceState: true });
        }
    });

    async function confirmAddon(addonId: string) {
        try {
            await sdk.forConsoleIn(page.params.region).projects.confirmAddonPayment({
                projectId: page.params.project,
                addonId
            });
            await Promise.all([invalidate(Dependencies.ADDONS), invalidate(Dependencies.PROJECT)]);
            addNotification({
                message: 'Premium Geo DB addon has been enabled',
                type: 'success'
            });
        } catch (e) {
            // Webhook may have already activated it — sync state and assume success
            if (e?.type === 'addon_not_found' || e?.code === 404) {
                await Promise.all([
                    invalidate(Dependencies.ADDONS),
                    invalidate(Dependencies.PROJECT)
                ]);
                addNotification({
                    message: 'Premium Geo DB addon has been enabled',
                    type: 'success'
                });
            } else if (e?.code === 402) {
                // Payment failed — the backend has cleaned up; offer to retry from scratch
                await invalidate(Dependencies.ADDONS);
                addNotification({
                    message:
                        e?.message ??
                        'Payment could not be authorized. Please try enabling the addon again.',
                    type: 'error'
                });
            } else {
                addNotification({
                    message: e.message,
                    type: 'error'
                });
            }
        }
    }

    async function handleRefresh() {
        if (!premiumGeoDBAddon) return;
        refreshing = true;
        try {
            await confirmAddon(premiumGeoDBAddon.$id);
        } finally {
            refreshing = false;
        }
    }

    async function handleReEnable() {
        reEnabling = true;
        try {
            const result: Models.Addon | Models.PaymentAuthentication = await sdk
                .forConsoleIn(page.params.region)
                .projects.createPremiumGeoDBAddon({
                    projectId: page.params.project
                });

            // Re-enabling a scheduled-for-removal addon is normally free (already paid for
            // the cycle), but the endpoint can still return a PaymentAuthentication if a
            // charge is required. Mirror the enable modal so 3DS is not silently dropped.
            if ('clientSecret' in result) {
                const paymentAuth = result as unknown as Models.PaymentAuthentication;
                const settingsUrl = resolve('/(console)/project-[region]-[project]/settings', {
                    region: page.params.region,
                    project: page.params.project
                });
                await confirmPayment({
                    clientSecret: paymentAuth.clientSecret,
                    paymentMethodId: $organization.paymentMethodId,
                    orgId: $organization.$id,
                    route: `${settingsUrl}?type=confirm-addon&addonId=${paymentAuth.addonId}`
                });
                return;
            }

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
    Give your project richer location intelligence on every user. Tailor pricing by region, surface the
    right currency and language, comply with local regulations, and spot suspicious sign-ins before they
    cause damage — all without leaving Appwrite.
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
                    A payment is awaiting confirmation. If you've completed authentication, click
                    refresh to check the payment status.
                </p>
                <Button
                    secondary
                    class="u-margin-block-start-16"
                    disabled={refreshing}
                    on:click={handleRefresh}>
                    <span class="text">Refresh</span>
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
