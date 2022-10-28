<script lang="ts">
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover } from '$lib/layout';
    import { project } from '../store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <h1 class="heading-level-4">
            <span class="text">{$project.name}</span>
        </h1>
        <Copy value={$project.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Project ID
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
