<script lang="ts">
    import { InputCheckbox } from '$lib/elements/forms';
    import type { Models } from '@aw-labs/appwrite-console';

    export let id: string;
    export let label: string;
    export let value: boolean;
    export let attribute: Models.AttributeInteger;
</script>

<InputCheckbox {id} {label} required={attribute.required} bind:value />
