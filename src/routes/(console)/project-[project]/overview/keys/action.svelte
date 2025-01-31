<script>
    import Button from '$lib/elements/forms/button.svelte';
    import { canWriteKeys } from '$lib/stores/roles';
    import { createApiKey } from './+page.svelte';
</script>

{#if $canWriteKeys}
    <Button on:click={createApiKey}>
        <span class="icon-plus" aria-hidden="true" />
        <span class="text">Create API key</span>
    </Button>
{/if}
