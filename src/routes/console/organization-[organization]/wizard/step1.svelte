<script lang="ts">
    import { Alert, CustomId, LabelCard, List, ListItem } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, FormList, Button } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import PaymentModal from '../billing/paymentModal.svelte';
    import { paymentMethods } from '../billing/store';
    import { createProject } from './store';

    let showCustomId = false;
    let showPaymentModal = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Project Details</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Project name"
            bind:value={$createProject.name}
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Project ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Project" bind:id={$createProject.id} />
        {/if}
    </FormList>

    <p class="text common-section">Plan</p>
    <ul
        class="grid-box u-margin-block-start-16"
        style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 1rem;">
        <li>
            <LabelCard name="plan" bind:group={$createProject.tier} value="premium">
                <svelte:fragment slot="title">Pro plan</svelte:fragment>
                For projects you want to scale. <b>$25/month</b>

                <h6 class="eyebrow-heading-3 u-margin-block-start-16">Includes up to:</h6>
                <div class="u-margin-block-start-8">
                    <List>
                        <ListItem>2XGB bandwidth</ListItem>
                        <ListItem>2XGB storage</ListItem>
                        <ListItem>2Xhrs compute</ListItem>
                        <ListItem>X days of logs</ListItem>
                        <ListItem>24/7 personalised support</ListItem>
                    </List>
                </div>
            </LabelCard>
        </li>
        <li>
            <LabelCard name="plan" bind:group={$createProject.tier} value="free">
                <svelte:fragment slot="title">Free plan</svelte:fragment>
                For personal, passion projects. <b>$0/month</b>
                <h6 class="eyebrow-heading-3 u-margin-block-start-16">Includes up to:</h6>
                <div class="u-margin-block-start-8">
                    <List>
                        <ListItem>1XGB bandwidth</ListItem>
                        <ListItem>1XGB storage</ListItem>
                        <ListItem>1Xhrs compute</ListItem>
                        <ListItem>7 days of logs</ListItem>
                        <ListItem>Email support within business hours</ListItem>
                    </List>
                </div>
            </LabelCard>
        </li>
    </ul>

    {#if !$paymentMethods?.length}
        <div class="common-section">
            <Alert type="warning">
                <svelte:fragment slot="title">Add a payment method to continue</svelte:fragment>
                You need to add a payment method to your organization to create a paid project.
                <svelte:fragment slot="action">
                    <div class="alert-buttons u-flex">
                        <Button text on:click={() => (showPaymentModal = true)}>
                            Add payment method
                        </Button>
                    </div>
                </svelte:fragment>
            </Alert>
        </div>
    {:else}
        {JSON.stringify($paymentMethods)}
    {/if}
</WizardStep>

{#if showPaymentModal}
    <PaymentModal bind:show={showPaymentModal} />
{/if}
