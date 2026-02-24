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
    import type { Models } from '@appwrite.io/console';

    export let show = false;

    let error: string = null;
    let submitting = false;

    async function handleSubmit() {
        submitting = true;
        error = null;
        try {
            const result: Models.Addon | Models.PaymentAuthentication =
                await sdk.forConsole.organizations.createToggleAddon({
                    organizationId: $organization.$id,
                    key: 'baa'
                });

            if ('clientSecret' in result) {
                const paymentAuth = result as unknown as Models.PaymentAuthentication;
                const settingsUrl = resolve(
                    '/(console)/organization-[organization]/settings',
                    { organization: $organization.$id }
                );
                await confirmPayment({
                    clientSecret: paymentAuth.clientSecret,
                    paymentMethodId: $organization.paymentMethodId,
                    orgId: $organization.$id,
                    route: `${settingsUrl}?type=validate-addon&addonId=${paymentAuth.invoiceId}`
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
            error = e.message;
            trackError(e, Submit.BAAAddonEnable);
        } finally {
            submitting = false;
        }
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} title="Enable BAA">
    <p class="text">
        By enabling BAA, a Business Associate Agreement will be activated for your organization to
        ensure HIPAA compliance.
    </p>
    <p class="text u-margin-block-start-8">
        This addon costs <b>$350/month</b>, prorated for the remainder of your current billing
        cycle.
    </p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={submitting}>Enable BAA</Button>
    </svelte:fragment>
</Modal>
