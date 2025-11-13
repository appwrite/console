<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { realtime } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    onMount(() => {
        return realtime.forProject(page.params.region, 'functions.*.executions', (response) => {
            if (response.events.includes('functions.*.executions.*')) {
                invalidate(Dependencies.EXECUTIONS);
            }
        });
    });
</script>

<slot />
