<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import type { Address } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';

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

<Modal
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}
    bind:error>
    <svelte:fragment slot="title">
        {linkedOrgs.length ? 'Unable to delete billing address' : 'Delete billing address'}
    </svelte:fragment>

    {#if linkedOrgs.length === 1}
        <p class="text">
            This billing address is set as the default for the <span class="u-bold"
                >{linkedOrgs[0].name}</span
            >. As it has upcoming invoices it cannot be deleted from your account.
        </p>
    {:else if linkedOrgs.length > 1}
        <p class="text">
            This billing address is set as the default for the following organisations. As they have
            upcoming invoices it cannot be deleted from your account.
        </p>
        <ul>
            {#each linkedOrgs as org}
                <li class="text">
                    <a class="link" href={`${base}/console/organization-${org.$id}/billing`}
                        >{org.name}</a>
                </li>
            {/each}
        </ul>
    {:else}
        <p class="text">Are you sure you want to delete this billing address from your account?</p>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        {#if !linkedOrgs.length}
            <Button secondary submit>Delete</Button>
        {/if}
    </svelte:fragment>
</Modal>
