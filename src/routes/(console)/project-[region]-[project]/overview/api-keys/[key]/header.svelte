<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Cover, CoverTitle } from '$lib/layout';
    import { key } from './store';
    import { ApiEndpoint, Copy } from '$lib/components';
    import { Layout, Tag, Icon } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';

    const projectId = page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${page.params.region}-${projectId}/overview/api-keys`}>
            {$key?.name}
        </CoverTitle>
        <Layout.Stack direction="row" inline>
            {#if $key?.secret}
            <Copy value={$key.secret} copyText="Copy API key">
                <Tag size="xs" variant="code">
                    <Icon icon={IconDuplicate} size="s" slot="start" />
                    <span
                        style:white-space="nowrap"
                        style:overflow="hidden"
                        style:word-break="break-all">
                        API key
                    </span>
                </Tag>
            </Copy>
            {/if}
            <ApiEndpoint />
        </Layout.Stack>
    </svelte:fragment>
</Cover>
