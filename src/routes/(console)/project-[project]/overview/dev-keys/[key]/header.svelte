<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { devKey } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${projectId}/overview/dev-keys`}>
            {$devKey?.name}
        </CoverTitle>
        <Id value={$devKey?.secret}>Dev key secret</Id>
    </svelte:fragment>
</Cover>
