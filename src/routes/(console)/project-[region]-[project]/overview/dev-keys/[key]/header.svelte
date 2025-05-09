<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Cover, CoverTitle } from '$lib/layout';
    import { devKey } from './store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`${base}/project-${page.params.region}-${page.params.project}/overview/dev-keys`}>
            {$devKey?.name}
        </CoverTitle>
    </svelte:fragment>
</Cover>
