<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
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

    const BAA_AGREEMENT_URL = 'https://appwrite.io/legal/baa';

    let error = $state<string | null>(null);
    let submitting = $state(false);

    async function handleSubmit() {
        submitting = true;
        error = null;
        try {
            const result: Models.Addon | Models.PaymentAuthentication =
                await sdk.forConsole.organizations.createBaaAddon({
                    organizationId: $organization.$id,
                    key: 'baa'
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
                message: 'BAA addon has been enabled',
                type: 'success'
            });
            trackEvent(Submit.BAAAddonEnable);
            show = false;
        } catch (e) {
            // 409 means addon already exists (pending or active from prior attempt)
            if (e?.code === 409) {
                await Promise.all([
                    invalidate(Dependencies.ADDONS),
                    invalidate(Dependencies.ORGANIZATION)
                ]);
                addNotification({
                    message: 'BAA addon is already active for your organization',
                    type: 'success'
                });
                show = false;
            } else {
                error = e.message;
                trackError(e, Submit.BAAAddonEnable);
            }
        } finally {
            submitting = false;
        }
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} title="HIPAA BAA">
    {#if addonPrice}
        <p class="text">
            By clicking <b>Accept & Enable</b>, the amount of
            <b>{formatCurrency(addonPrice.monthlyPrice)}</b> will be added to your subscription and
            your payment method will be charged
            <b>{formatCurrency(addonPrice.proratedAmount)} immediately</b> for the remaining days in your
            billing cycle.
        </p>
        <p class="text u-margin-block-start-16">
            Your action confirms acceptance of Appwrite's
            <a class="link" href={BAA_AGREEMENT_URL} target="_blank" rel="noopener noreferrer"
                >Business Associate Agreement</a>
            and related terms.
        </p>

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
        <Button secondary submit disabled={submitting || !addonPrice}>Accept & Enable</Button>
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
