<script lang="ts">
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { deployment } from './store';
    import SiteCard from '../../../(components)/siteCard.svelte';
    import Logs from '../../../(components)/logs.svelte';
    import Card from '$lib/components/card.svelte';

    export let data;

    let logs = '';

    onMount(() => {
        logs = $deployment.buildLogs;
        if ($deployment.status === 'ready') {
            return;
        }
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (
                message.events.includes(
                    `sites.${$page.params.site}.deployments.${$page.params.deployment}.update`
                )
            ) {
                logs = message.payload['logs'];
                if (message.payload.status === 'ready') {
                    invalidate(Dependencies.DEPLOYMENT);
                }
            }
        });
    });
</script>

<Container>
    <SiteCard deployment={data.deployment} proxyRuleList={data.proxyRuleList} />
    <Card isTile>
        <Logs site={data.site} deployment={data.deployment} />
    </Card>
</Container>
