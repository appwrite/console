<script lang="ts">
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover, CoverTitle } from '$lib/layout';
    import { project } from '../store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>
            {$project?.name}
        </CoverTitle>
        <Copy value={$project.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Project ID
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
