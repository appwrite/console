<script lang="ts">
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let optionalText: string | undefined = undefined;
    export let attribute: Models.AttributeUrl;
</script>

<InputEmail {id} {label} placeholder="Enter URL" required={attribute.required} bind:value />
