<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { timer } from '$lib/actions/timer';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { capitalize } from '$lib/helpers/string';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
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

    function badgeType(status: string) {
        switch (status) {
            case 'failed':
                return 'error';
            case 'ready':
                return 'success';
            case 'building':
                return undefined;
            case 'processing':
                return 'warning';
            default:
                return undefined;
        }
    }
</script>

<Layout.Stack gap="xl">
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center" gap="s" inline>
            <Typography.Text variant="m-500" color="--color-fgcolor-neutral-primary">
                Deployment logs
            </Typography.Text>
            <Badge
                content={capitalize(status)}
                size="xs"
                variant="secondary"
                type={badgeType(status)} />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" inline>
            {#if ['processing', 'building'].includes(status)}
                <Typography.Code color="--color-fgcolor-neutral-secondary">
                    <Layout.Stack direction="row" alignItems="center" inline>
                        <p use:timer={{ start: deployment.$createdAt }} />
                        <Spinner size="s" />
                    </Layout.Stack>
                </Typography.Code>
            {:else}
                <Typography.Code color="--color-fgcolor-neutral-secondary">
                    {formatTimeDetailed(deployment.buildTime)}
                </Typography.Code>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
    {#key buildLogs}
        <Logs logs={buildLogs} />
    {/key}
    {#if ['processing', 'building'].includes(status)}
        <Layout.Stack alignItems="flex-end">
            <Button size="s" text on:click={cancelDeployment}>Cancel deployment</Button>
        </Layout.Stack>
    {/if}
</Layout.Stack>
