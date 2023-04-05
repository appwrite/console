<script lang="ts">
    import { ID } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { project } from '../store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>
            {$project?.name}
        </CoverTitle>
        <ID value={$project.$id}>{$project.$id}</ID>
    </svelte:fragment>
</Cover>
