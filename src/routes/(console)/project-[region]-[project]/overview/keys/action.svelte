<script>
    import Button from '$lib/elements/forms/button.svelte';
    import { canWriteKeys } from '$lib/stores/roles';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
</script>

{#if $canWriteKeys}
    <Button href={`${base}/project-${page.params.project}/overview/keys/create`}>
        <Icon icon={IconPlus} slot="start" size="s" />
        Create API key
    </Button>
{/if}
