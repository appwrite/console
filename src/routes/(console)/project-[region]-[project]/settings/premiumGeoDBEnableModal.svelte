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
    import type { Models } from '@appwrite.io/console';

    let {
        show = $bindable(false)
    }: {
        show: boolean;
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
    <p class="text">
        By clicking <b>Enable</b>, your payment method will be charged for the prorated amount for
        the remaining days in your billing cycle, and the addon will be added to this project's
        subscription for future cycles.
    </p>
    <p class="text u-margin-block-start-16">
        Premium Geo DB enriches session and request data with premium geolocation details including
        timezone, postal code, ISP, connection type, and organization.
    </p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={submitting}>Enable</Button>
    </svelte:fragment>
</Modal>
