<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import EmptyCardAsideCloud from '$lib/components/emptyCardAsideCloud.svelte';
    import { BillingPlan } from '$lib/constants';
    import { Button, Form, FormList } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { organization } from '$lib/stores/organization';

    let enableBranding = false;

    async function handleSubmit() {
        // try {
        //     await organization.update({ emailSignature: !organization.emailSignature });
        // } catch (error) {
        //     console.error(error);
        // }
    }
</script>

<Form onSubmit={handleSubmit}>
    <CardGrid>
        <Heading size="7" tag="h3">Email signature</Heading>
        <p class="text">Enable or disable Appwrite branding in your email template signature.</p>

        <svelte:fragment slot="aside">
            {#if $organization?.billingPlan && $organization.billingPlan !== BillingPlan.STARTER}
                <FormList>
                    <InputChoice
                        type="switchbox"
                        id="branding"
                        label="Enable Appwrite branding"
                        bind:value={enableBranding}>
                        When enabled, Appwrite branding will be displayed in your email signature.
                    </InputChoice>
                </FormList>
            {:else}
                <EmptyCardAsideCloud source="email_signature_card" let:nextTier>
                    <svelte:fragment slot="title">Upgrade to edit email signature</svelte:fragment>
                    Upgrade to a {nextTier} plan to enable or disable Appwrite branding in your emails.
                </EmptyCardAsideCloud>
            {/if}
        </svelte:fragment>
        <svelte:fragment slot="actions">
            {#if $organization?.billingPlan && $organization.billingPlan !== BillingPlan.STARTER}
                <Button submit>Update</Button>
            {/if}
        </svelte:fragment>
    </CardGrid>
</Form>
