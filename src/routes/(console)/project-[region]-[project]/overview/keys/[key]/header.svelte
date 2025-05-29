<script lang="ts">
    import { key } from './store';
    import { Cover, CoverTitle } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/overview/keys')}>
            {$key?.name}
        </CoverTitle>
    </svelte:fragment>
</Cover>
