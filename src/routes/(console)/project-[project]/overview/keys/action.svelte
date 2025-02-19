<script>
    import Button from '$lib/elements/forms/button.svelte';
    import { canWriteKeys } from '$lib/stores/roles';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { createApiKey } from './+page.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
</script>

{#if $canWriteKeys}
    <Button on:click={createApiKey}>
        <Icon icon={IconPlus} slot="start" size="s" />
        Create API key
    </Button>
{/if}
