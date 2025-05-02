<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { template } from './store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`${base}/project-${page.params.region}-${page.params.project}/functions/templates`}>
            {$template.name}
        </CoverTitle>
        <Id value={$template.id} event="user">{$template.id}</Id>
    </svelte:fragment>
</Cover>
