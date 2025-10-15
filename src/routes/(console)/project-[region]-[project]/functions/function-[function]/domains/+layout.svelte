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
                if (
                    response.events.includes('rules.*.update') ||
                    response.events.includes('rules.*.create') ||
                    response.events.includes('rules.*.delete')
                ) {
                    if ((response.payload as any)?.deploymentResourceId === page.params.function) {
                        invalidate(Dependencies.FUNCTION_DOMAINS);
                    }
                }
            });
    });
</script>

<slot />
