<script lang="ts">
    import { Selector } from '@appwrite.io/pink-svelte';

    export let label: string = null;
    export let id: string;
    export let group: string;
    export let value: string;
    export let name: string;
    export let required = false;
    export let disabled = false;
    export let size: 's' | 'm' = 'm';
</script>

<Selector.Radio
    {id}
    {name}
    {disabled}
    {required}
    {value}
    {label}
    {size}
    bind:group
    on:invalid
    on:change />
