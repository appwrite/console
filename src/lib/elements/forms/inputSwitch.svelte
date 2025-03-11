<script lang="ts">
    import { Selector } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let value = false;
    export let disabled = false;
    export let description: string = undefined;
</script>

<Selector.Switch {id} {description} {label} {disabled} bind:checked={value} on:invalid on:change>
    <slot name="description" slot="description" />
</Selector.Switch>
