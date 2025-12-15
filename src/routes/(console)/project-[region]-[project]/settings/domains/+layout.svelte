<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { realtime, RuleType } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { type Models } from '@appwrite.io/console';

    onMount(() => {
        return realtime.forProject(page.params.region, ['console', 'project'], (response) => {
            if (response.events.includes('rules.*.update')) {
                const proxyRule = response.payload as Models.ProxyRule;
                if (proxyRule.type === RuleType.API) {
                    invalidate(Dependencies.DOMAINS);
                }
            }
        });
    });
</script>

<slot />
