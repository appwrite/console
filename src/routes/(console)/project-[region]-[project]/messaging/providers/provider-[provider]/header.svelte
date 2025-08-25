<script lang="ts">
    import { provider } from './store';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/messaging/providers')}>
            {$provider?.name ? $provider?.name : '-'}
        </CoverTitle>
        <Id value={$provider?.$id} event="provider">{$provider?.$id}</Id>
    </svelte:fragment>
</Cover>
