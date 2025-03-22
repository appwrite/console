<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { message } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${$page.params.region}-${projectId}/messaging`}>
            {$message.data.title ?? $message.data.subject ?? $message.data.content ?? 'Message'}
        </CoverTitle>
        <Id value={$message.$id} event="message">{$message.$id}</Id>
    </svelte:fragment>
</Cover>
