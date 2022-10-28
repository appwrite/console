<script lang="ts">
    import { page } from '$app/stores';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover } from '$lib/layout';
    import { webhook } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <a
            class="back-button"
            href={`/console/project-${projectId}/settings/webhooks`}
            aria-label="page back">
            <span class="icon-cheveron-left" aria-hidden="true" />
        </a>
        <h1 class="heading-level-4">
            <span class="text">{$webhook.name}</span>
        </h1>
        <Copy value={$webhook.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Webhook ID
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
