<script lang="ts">
    import { InputSelectSearch } from '$lib/elements/forms';
    import type { Models } from '@aw-labs/appwrite-console';

    export let id: string;
    export let label: string;
    export let value: number;
    export let attribute: Models.AttributeInteger;
    export let optionalText: string | undefined = undefined;
</script>

<InputSelectSearch {id} {label} {optionalText} required={attribute.required} bind:value />
