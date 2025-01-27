<script lang="ts">
    import { Selector } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let value = false;
    export let disabled = false;
</script>

<Selector.Switch {id} {label} {disabled} bind:checked={value} on:invalid on:change />
