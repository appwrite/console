<script lang="ts">
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { template } from './store';
    import { getProjectRoute } from '$lib/helpers/project';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/functions/templates')}>
            {$template.name}
        </CoverTitle>
        <Id value={$template.id} event="user">{$template.id}</Id>
    </svelte:fragment>
</Cover>
