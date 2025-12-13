<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { realtime } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { ProxyRuleDeploymentResourceType, type Models } from '@appwrite.io/console';

    onMount(() => {
        return realtime.forProject(page.params.region, ['console', 'project'], (response) => {
            if (response.events.includes('rules.*.update')) {
                const proxyRule = response.payload as Models.ProxyRule;
                if (
                    proxyRule.deploymentResourceType === ProxyRuleDeploymentResourceType.Site &&
                    proxyRule.deploymentResourceId === page.params.site
                ) {
                    invalidate(Dependencies.SITES_DOMAINS);
                }
            }
        });
    });
</script>

<slot />
