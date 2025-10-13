<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { realtime } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';

    onMount(() => {
        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe('console', (response) => {
                if (response.events.includes('projects.*.proxy.*.update')) {
                    invalidate(Dependencies.DOMAINS);
                }
            });
    });
</script>

<slot />
