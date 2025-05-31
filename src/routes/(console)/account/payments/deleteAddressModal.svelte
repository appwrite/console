<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import type { Address } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Link } from '@appwrite.io/pink-svelte';

    export let showDelete = false;
    export let selectedAddress: Address;
    export let linkedOrgs: Organization[] = [];
    let error: string = null;

    async function handleDelete() {
        try {
            await sdk.forConsole.billing.deleteAddress(selectedAddress.$id);
            await invalidate(Dependencies.PAYMENT_METHODS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Address has been deleted`
            });
            trackEvent(Submit.BillingAddressDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.BillingAddressDelete);
        }
    }
</script>

<Confirm
    onSubmit={handleDelete}
    title={linkedOrgs.length ? 'Unable to delete billing address' : 'Delete billing address'}
    bind:open={showDelete}
    canDelete={linkedOrgs.length === 0}
    bind:error>
    {#if linkedOrgs.length === 1}
        <p>
            This billing address is set as the default for the <span class="u-bold"
                >{linkedOrgs[0].name}</span
            >. As it has upcoming invoices it cannot be deleted from your account.
        </p>
    {:else if linkedOrgs.length > 1}
        <p>
            This billing address is set as the default for the following organisations. As they have
            upcoming invoices it cannot be deleted from your account.
        </p>
        <Layout.Stack gap="none">
            {#each linkedOrgs as org}
                <Link.Anchor href={`${base}/organization-${org.$id}/billing`}>
                    {org.name}
                </Link.Anchor>
            {/each}
        </Layout.Stack>
    {:else}
        <p>Are you sure you want to delete this billing address from your account?</p>
    {/if}
</Confirm>
