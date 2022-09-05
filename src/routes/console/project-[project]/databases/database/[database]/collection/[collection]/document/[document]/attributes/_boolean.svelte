<script lang="ts">
    import { InputSwitch } from '$lib/elements/forms';
    import type { Models } from '@aw-labs/appwrite-console';

    export let id: string;
    export let label: string;
    export let value: boolean;
    export let attribute: Models.AttributeInteger;
</script>

<InputSwitch {id} {label} required={attribute.required} bind:value />
