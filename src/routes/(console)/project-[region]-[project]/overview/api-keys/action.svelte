<script>
    import Button from '$lib/elements/forms/button.svelte';
    import { canWriteKeys } from '$lib/stores/roles';
    import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
</script>

<Tooltip disabled={$canWriteKeys}>
    <Button
        href={`${base}/project-${page.params.region}-${page.params.project}/overview/api-keys/create`}
        disabled={!$canWriteKeys}>
        <Icon icon={IconPlus} slot="start" size="s" />
        Create API key
    </Button>
    <div slot="tooltip">Your role does not allow this action</div>
</Tooltip>
