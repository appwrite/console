<script lang="ts">
    import { FormList, InputRadio, InputText } from '$lib/elements/forms';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createOrganization } from './store';

    let methods = [];
    let name: string;

    onMount(async () => {
        methods = await sdk.forConsole.billing.listPaymentMethods('TEST');
        if (methods.length) {
            $createOrganization.payment = methods[0].id;
        }
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Payment details</svelte:fragment>
    <svelte:fragment slot="subtitle">Add a payment method to your organization.</svelte:fragment>

    <FormList>
        <div class:boxes-wrapper={methods?.length}>
            {#each methods as method}
                <div class="box">test</div>
                <InputRadio
                    id="payment-method"
                    label="Payment method"
                    value={method.id}
                    name={method.id}
                    group="payment" />
            {/each}

            <div class="box">
                <InputRadio
                    id="payment-method"
                    label="Add new payment method"
                    value={null}
                    name="test"
                    group={$createOrganization.payment} />
                {#if $createOrganization.payment === null}
                    <InputText
                        id="name"
                        label="Cardholder name"
                        placeholder="Cardholder name"
                        bind:value={name}
                        required
                        autofocus={true} />

                    <div id="payment-element">
                        <!-- Elements will create form elements here -->
                    </div>
                {/if}
            </div>
        </div>

        <InputChoice type="switchbox" id="budget" label="Enable budget cap" tooltip="lorem ipsum">
            <p class="text">
                Restrict your resource usage by setting a budget cap. <a
                    class="link"
                    href="http://#"
                    target="_blank"
                    rel="noopener noreferrer">Learn more about usage rates</a
                >.
            </p>
        </InputChoice>
    </FormList>
</WizardStep>
