<script lang="ts">
    import { FloatingActionBar } from '@appwrite.io/pink-svelte';

    export let show = false;
</script>

{#if show}
    <FloatingActionBar>
        <slot name="start" slot="start" />
        <slot name="end" slot="end" />
    </FloatingActionBar>
{/if}
