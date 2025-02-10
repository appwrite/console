<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { timer } from '$lib/actions/timer';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Logs, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let site: Models.Site;
    export let deployment: Models.Deployment;

    let { status, buildLogs } = deployment;

    onMount(() => {
        const unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
            if (
                response.events.includes(
                    `sites.${deployment.resourceId}.deployments.${deployment.$id}.update`
                )
            ) {
                const res = response.payload as Partial<Models.Deployment> & { logs: string };
                console.log(res);
                status = res.status;
                // Models.Deployment has no `logs`, the payload sends `logs` though
                buildLogs = res.logs;

                if (status === 'ready') {
                    goto(
                        `${base}/project-${$page.params.project}/sites/create-site/finish?site=${site.$id}`
                    );
                }
            }
        });
        return () => unsubscribe();
    });

    async function cancelDeployment() {
        try {
            await sdk.forProject.sites.updateDeploymentBuild(deployment.resourceId, deployment.$id);
            await invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                type: 'success',
                message: `Deployment has been canceled`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    $: console.log(buildLogs);
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <Typography.Text variant="m-500">Deployment logs</Typography.Text>
            <Badge
                content={status}
                size="xs"
                variant="secondary"
                type={status === 'failed' ? 'error' : undefined} />
        </Layout.Stack>
        <div>
            <Layout.Stack direction="row" alignItems="center">
                {#if ['processing', 'building'].includes(status)}
                    <span use:timer={{ start: deployment.$createdAt }} />
                    <Spinner />
                {:else}
                    {calculateTime(deployment.buildTime)}
                {/if}
            </Layout.Stack>
        </div>
    </Layout.Stack>

    <Logs logs={buildLogs} />

    <Layout.Stack alignItems="flex-end">
        {#if ['processing', 'building'].includes(status)}
            <Button size="xs" text on:click={cancelDeployment}>Cancel deployment</Button>
        {/if}
    </Layout.Stack>
</Layout.Stack>
