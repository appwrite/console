<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    let taxId: string;

    onMount(() => {
        taxId = $organization?.taxId;
    });

    async function updateTaxId() {
        try {
            await sdk.forConsole.billing.setBillingAddress($organization.$id, taxId || undefined);
            await invalidate(Dependencies.ADDRESS);
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
        <Heading tag="h2" size="6">Tax ID</Heading>
        Add a tax identification number to your organization.
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    label="Tax ID"
                    placeholder="Enter tax ID"
                    id="taxId"
                    bind:value={taxId} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$organization?.taxId === taxId} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
