<script lang="ts">
    import { InputCheckbox, InputSelect } from '$lib/elements/forms';
    import type { Models } from '@aw-labs/appwrite-console';

    export let id: string;
    export let label: string;
    export let value: boolean;
    export let attribute: Models.AttributeBoolean;
</script>

{#if attribute?.array}
    <InputSelect
        {id}
        {label}
        showLabel={!!label?.length}
        placeholder="Select a value"
        required={attribute.required}
        options={[
            { label: 'True', value: true },
            { label: 'False', value: false }
        ]}
        bind:value />
{:else}
    <InputCheckbox {id} {label} required={attribute.required} bind:value />
{/if}
