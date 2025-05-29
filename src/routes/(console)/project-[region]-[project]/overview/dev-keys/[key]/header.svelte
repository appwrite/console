<script lang="ts">
    import { Cover, CoverTitle } from '$lib/layout';
    import { devKey } from './store';
    import { getProjectRoute } from '$lib/helpers/project';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/overview/dev-keys')}>
            {$devKey?.name}
        </CoverTitle>
    </svelte:fragment>
</Cover>
