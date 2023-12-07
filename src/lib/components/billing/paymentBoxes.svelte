<script lang="ts">
    import { FormList, InputText } from '$lib/elements/forms';
    import { CreditCardBrandImage, RadioBoxes } from '..';

    export let methods: Record<string, unknown>[];
    export let group: string;
    export let name: string;
</script>

<RadioBoxes elements={methods} total={methods?.length} variableName="$id" name="payment" bind:group>
    <svelte:fragment slot="element" let:element>
        <slot {element}>
            <span class="u-flex u-cross-center u-gap-8" style="padding-inline:0.25rem">
                <span>
                    <span class="u-capitalize">{element.brand}</span> ending in {element.last4}</span>
                <CreditCardBrandImage brand={element.brand?.toString()} />
            </span>
        </slot>
    </svelte:fragment>
    <svelte:fragment slot="new">
        <span style="padding-inline:0.25rem">Add new payment method</span>
    </svelte:fragment>

    <FormList class="u-margin-block-start-8" gap={16}>
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
    </FormList>
</RadioBoxes>
