<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { domain } from './store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`}>
            {$domain.domain}
        </CoverTitle>
        <Id value={$domain.$id}>{$domain.$id}</Id>
    </svelte:fragment>
</Cover>
