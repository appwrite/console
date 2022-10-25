<script lang="ts">
    import { page } from '$app/stores';
    import { Cover } from '$lib/layout';
    import { platform } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <a
            class="back-button"
            href={`/console/project-${projectId}/overview/platforms`}
            aria-label="page back">
            <span class="icon-cheveron-left" aria-hidden="true" />
        </a>
        <h1 class="heading-level-4">
            <span class="text">{$platform?.name}</span>
        </h1>
    </svelte:fragment>
</Cover>
