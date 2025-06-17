<script lang="ts">
    import { webhook } from './store';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/settings/webhooks')}>
            {$webhook?.name}
        </CoverTitle>
        <Id value={$webhook?.$id} event="webhook">{$webhook?.$id}</Id>
    </svelte:fragment>
</Cover>
