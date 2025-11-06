<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Cover, CoverTitle } from '$lib/layout';
    import { key } from './store';
    import { RegionEndpoint, Copy } from '$lib/components';
    import { Layout, Tag, Icon } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { projectRegion } from '../../../store';

    const projectId = page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${page.params.region}-${projectId}/overview/api-keys`}>
            {$key?.name}
        </CoverTitle>
        <Layout.Stack direction="row" inline>
            {#if $key?.secret}
                <Copy value={$key.secret} copyText="Copy API secret">
                    <Tag size="xs" variant="code">
                        <Icon icon={IconDuplicate} size="s" slot="start" />
                        <span class="api-secret-label"> API secret </span>
                    </Tag>
                </Copy>
            {/if}
            {#if $projectRegion}
                <RegionEndpoint region={$projectRegion} />
            {/if}
        </Layout.Stack>
    </svelte:fragment>
</Cover>

<style>
    .api-secret-label {
        white-space: nowrap;
        overflow: hidden;
        word-break: break-all;
    }
</style>
