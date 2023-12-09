<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';

    export let linkedOrgs: Organization[] = [];
    export let showDelete = false;
    export let method: string;

    async function handleDelete() {
        try {
            await sdk.forConsole.billing.deletePaymentMethod(method);
            await invalidate(Dependencies.PAYMENT_METHODS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Payment method has been deleted`
            });
            trackEvent(Submit.PaymentMethodDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.PaymentMethodDelete);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="title">
        {linkedOrgs.length ? 'Unable to delete payment method' : 'Delete payment method'}
    </svelte:fragment>
    {#if linkedOrgs.length === 1}
        <p class="text">
            This payment method is set as the default for the <span class="u-bold"
                >{linkedOrgs[0].name}</span
            >. As it has upcoming invoices it cannot be deleted from your account.
        </p>
    {:else if linkedOrgs.length > 1}
        <p class="text">
            This payment method is set as the default for the following organisations. As they have
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
        <p class="text">Are you sure you want to delete this payment method from your account?</p>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        {#if !linkedOrgs.length}
            <Button secondary submit>Delete</Button>
        {/if}
    </svelte:fragment>
</Modal>
