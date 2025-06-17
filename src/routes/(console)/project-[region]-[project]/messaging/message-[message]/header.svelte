<script lang="ts">
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { message } from './store';
    import { getProjectRoute } from '$lib/helpers/project';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute('/messaging')}>
            {$message.data.title ?? $message.data.subject ?? $message.data.content ?? 'Message'}
        </CoverTitle>
        <Id value={$message.$id} event="message">{$message.$id}</Id>
    </svelte:fragment>
</Cover>
