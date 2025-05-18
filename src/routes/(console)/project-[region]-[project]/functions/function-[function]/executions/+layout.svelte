<script>
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Dependencies } from '$lib/constants';
    import { realtime } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    onMount(() => {
        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe('functions.*.executions', (response) => {
                if (response.events.includes('functions.*.executions.*')) {
                    invalidate(Dependencies.EXECUTIONS);
                }
            });
    });
</script>

<slot />
