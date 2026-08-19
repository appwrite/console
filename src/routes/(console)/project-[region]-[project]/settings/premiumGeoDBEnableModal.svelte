<script lang="ts">
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { confirmPayment } from '$lib/stores/stripe';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { formatCurrency } from '$lib/helpers/numbers';
    import type { Models } from '@appwrite.io/console';

    let {
        show = $bindable(false),
        addonPrice = null
    }: {
        show: boolean;
        addonPrice: Models.AddonPrice | null;
    } = $props();

    let error = $state<string | null>(null);
    let submitting = $state(false);

    async function handleSubmit() {
        submitting = true;
        error = null;
        try {
            const result: Models.Addon | Models.PaymentAuthentication = await sdk
                .forConsoleIn(page.params.region)
                .projects.createPremiumGeoDBAddon({
                    projectId: page.params.project
                });

            if ('clientSecret' in result) {
                const paymentAuth = result as unknown as Models.PaymentAuthentication;
                const settingsUrl = resolve('/(console)/project-[region]-[project]/settings', {
                    region: page.params.region,
                    project: page.params.project
                });
                const outcome = await confirmPayment({
                    clientSecret: paymentAuth.clientSecret,
                    paymentMethodId: $organization.paymentMethodId,
                    orgId: $organization.$id,
                    route: `${settingsUrl}?type=confirm-addon&addonId=${paymentAuth.addonId}`,
                    redirectIfRequired: true
                });

                if (!outcome || outcome.status === 'error') {
                    if (outcome?.status === 'error') {
                        error = outcome.message;
                    }
                    return;
                }

                // 3DS challenge required — Stripe redirects; the settings onMount
                // handler finalizes on return via ?type=confirm-addon.
                if (outcome.status === 'requires_action') {
                    return;
                }

                try {
                    await sdk.forConsoleIn(page.params.region).projects.confirmAddonPayment({
                        projectId: page.params.project,
                        addonId: paymentAuth.addonId
                    });
                } catch (e) {
                    // A 404 here means the Stripe webhook already consumed the invoice
                    // and activated the addon (race) — the addon is enabled, so sync
                    // state and assume success rather than surfacing the error.
                    if (
                        e?.type !== 'billing_invoice_not_found' &&
                        e?.type !== 'addon_not_found' &&
                        e?.code !== 404
                    ) {
                        throw e;
                    }
                }

                await Promise.all([
                    invalidate(Dependencies.ADDONS),
                    invalidate(Dependencies.PROJECT)
                ]);

                if (outcome.status === 'processing') {
                    addNotification({
                        message:
                            "Premium Geo DB addon payment is processing — we'll activate it shortly.",
                        type: 'info'
                    });
                } else {
                    addNotification({
                        message: 'Premium Geo DB addon has been enabled',
                        type: 'success'
                    });
                }
                show = false;
                return;
            }

            await Promise.all([invalidate(Dependencies.ADDONS), invalidate(Dependencies.PROJECT)]);
            addNotification({
                message: 'Premium Geo DB addon has been enabled',
                type: 'success'
            });
            show = false;
        } catch (e) {
            // 409 means addon already exists (pending or active from prior attempt)
            if (e?.code === 409) {
                await Promise.all([
                    invalidate(Dependencies.ADDONS),
                    invalidate(Dependencies.PROJECT)
                ]);
                addNotification({
                    message: 'Premium Geo DB addon is already active for this project',
                    type: 'success'
                });
                show = false;
            } else {
                error = e.message;
            }
        } finally {
            submitting = false;
        }
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} title="Enable Premium Geo DB">
    {#if addonPrice}
        <p class="text">
            By clicking <b>Enable</b>, the amount of
            <b>{formatCurrency(addonPrice.monthlyPrice)}</b> will be added to your subscription and
            your payment method will be charged
            <b>{formatCurrency(addonPrice.proratedAmount)} immediately</b> for the remaining days in your
            billing cycle.
        </p>
    {:else}
        <p class="text">
            By clicking <b>Enable</b>, your payment method will be charged for the prorated amount
            for the remaining days in your billing cycle, and the addon will be added to this
            project's subscription for future cycles.
        </p>
    {/if}
    <p class="text u-margin-block-start-16">
        Premium Geo DB enriches session and request data with premium geolocation details including
        timezone, postal code, ISP, connection type, and organization.
    </p>

    {#if addonPrice}
        <div class="price-breakdown u-margin-block-start-24">
            <div class="price-row">
                <span class="text">{addonPrice.name}</span>
                <span class="text">{formatCurrency(addonPrice.monthlyPrice)} / month</span>
            </div>
            <hr class="divider" />
            <div class="price-row u-bold">
                <span class="text">Due today (prorated)</span>
                <span class="text">{formatCurrency(addonPrice.proratedAmount)}</span>
            </div>
            <p class="text u-color-text-offline u-margin-block-start-8 u-text-end">
                * Plus applicable tax and fees
            </p>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={submitting}>Enable</Button>
    </svelte:fragment>
</Modal>

<style>
    .price-breakdown {
        border: 1px solid hsl(var(--color-border));
        border-radius: var(--border-radius-small);
        padding: 1rem;
    }

    .price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .divider {
        border: none;
        border-top: 1px solid hsl(var(--color-border));
        margin-block: 0.75rem;
    }

    .u-text-end {
        text-align: end;
    }
</style>
