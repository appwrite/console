<script lang="ts">
    import { Copy } from '.';
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { getProjectEndpoint } from '$lib/helpers/project';
</script>

<Copy value={getProjectEndpoint()} copyText="Copy endpoint">
    <Tag size="xs" variant="code">
        <Icon icon={IconDuplicate} size="s" slot="start" />
        <span style:white-space="nowrap" style:overflow="hidden" style:word-break="break-all">
            API endpoint
        </span>
    </Tag>
</Copy>
