<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    let taxId: string;

    onMount(() => {
        taxId = $organization?.billingTaxId;
    });

    async function updateTaxId() {
        try {
            await sdk.forConsole.organizations.setBillingTaxId($organization.$id, taxId);
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                type: 'success',
                message: `${$organization.name} tax ID has been successfully updated`
            });
            trackEvent(Submit.OrganizationBillingTaxIdUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationBillingTaxIdUpdate);
        }
    }
</script>

<Form onSubmit={updateTaxId}>
    <CardGrid>
        <svelte:fragment slot="title">Tax ID</svelte:fragment>
        Add a tax identification number to your organization.
        <svelte:fragment slot="aside">
            <InputText label="Tax ID" placeholder="Enter tax ID" id="taxId" bind:value={taxId} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$organization?.billingTaxId === taxId} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
