<script lang="ts">
    import InputURL from '$lib/elements/forms/inputURL.svelte';
    import type { Nullable } from '$lib/helpers/type';
    import type { Models } from '@aw-labs/appwrite-console';

    export let id: string;
    export let label: string;
    export let value: Nullable<string>;
    export let attribute: Models.AttributeUrl;
</script>

<InputURL {id} {label} showLabel={!!label?.length} required={attribute.required} bind:value />
