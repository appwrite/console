<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Link, Typography } from '@appwrite.io/pink-svelte';

    export let linkedOrgs: Organization[] = [];
    export let showDelete = false;
    export let method: string;

    let error: string;

    async function handleDelete() {
        try {
            await sdk.forConsole.account.deletePaymentMethod(method);
            await invalidate(Dependencies.PAYMENT_METHODS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Payment method has been deleted`
            });
            trackEvent(Submit.PaymentMethodDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.PaymentMethodDelete);
        }
    }
</script>

<Confirm
    onSubmit={handleDelete}
    title={linkedOrgs.length ? 'Unable to delete payment method' : 'Delete payment method'}
    canDelete={linkedOrgs.length === 0}
    bind:open={showDelete}
    bind:error>
    {#if linkedOrgs.length === 1}
        <Typography.Text>
            This payment method is set as the default for the <span class="u-bold"
                >{linkedOrgs[0].name}</span
            >. As it has upcoming invoices it cannot be deleted from your account.
        </Typography.Text>
    {:else if linkedOrgs.length > 1}
        <Typography.Text>
            This payment method is set as the default for the following organisations. As they have
            upcoming invoices it cannot be deleted from your account.
        </Typography.Text>
        <Layout.Stack gap="none">
            {#each linkedOrgs as org}
                <Link.Anchor href={`${base}/organization-${org.$id}/billing`}>
                    {org.name}
                </Link.Anchor>
            {/each}
        </Layout.Stack>
    {:else}
        <p class="text">Are you sure you want to delete this payment method from your account?</p>
    {/if}
</Confirm>
