<script lang="ts">
    import { page } from '$app/stores';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover } from '$lib/layout';
    import { key } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <a
            class="back-button"
            href={`/console/project-${projectId}/overview/keys`}
            aria-label="page back">
            <span class="icon-cheveron-left" aria-hidden="true" />
        </a>
        <h1 class="heading-level-4">
            <span class="text">{$key.name}</span>
        </h1>
        <Copy value={$key.secret}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                API Key Secret
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
