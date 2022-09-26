<script lang="ts">
    import { wizard } from '$lib/stores/wizard';
</script>

{#if $wizard.show && $wizard.component}
    <svelte:component this={$wizard.component} />
{/if}
