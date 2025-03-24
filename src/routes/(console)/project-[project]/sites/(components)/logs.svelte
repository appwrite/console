<script context="module" lang="ts">
    export function badgeTypeDeployment(status: string) {
        switch (status) {
            case 'failed':
                return 'error';
            case 'ready':
                return 'success';
            case 'building':
                return 'warning';
            case 'processing':
                return undefined;
            default:
                return undefined;
        }
    }
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { capitalize } from '$lib/helpers/string';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Logs, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import LogsTimer from './logsTimer.svelte';

    export let site: Models.Site;
    export let deployment: Models.Deployment;
    export let hideTitle = false;
    export let hideScrollButtons = false;
    export let height = 'auto';
    export let fullHeight = false;
    export let emptyCopy = 'No logs available';

    let { status, buildLogs } = deployment;

    onMount(() => {
        const unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
            if (
                response.events.includes(
                    `sites.${deployment.resourceId}.deployments.${deployment.$id}.update`
                )
            ) {
                const res = response.payload as Partial<Models.Deployment>;
                status = res.status;
                buildLogs = res.buildLogs;

                if (status === 'ready') {
                    goto(
                        `${base}/project-${$page.params.project}/sites/create-site/finish?site=${site.$id}`
                    );
                }
            }
        });
        return () => unsubscribe();
    });

    function setCopy() {
        if (status === 'failed') {
            return 'Your deployment has failed.';
        } else if (status === 'building') {
            return 'Build is starting.';
        } else if (status === 'processing') {
            return 'Your deployment is processing.';
        } else {
            return emptyCopy;
        }
    }
</script>

<Layout.Stack gap="xl">
    {#if !hideTitle}
        <Layout.Stack direction="row" justifyContent="space-between">
            <Layout.Stack direction="row" alignItems="center" gap="s" inline>
                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                    Deployment logs
                </Typography.Text>
                <Badge
                    content={capitalize(status)}
                    size="xs"
                    variant="secondary"
                    type={badgeTypeDeployment(status)} />
            </Layout.Stack>
            <LogsTimer {status} {deployment} />
        </Layout.Stack>
    {/if}
    {#key buildLogs}
        <Logs
            {fullHeight}
            {height}
            showScrollButton={!hideScrollButtons}
            logs={buildLogs || setCopy()}
            bind:theme={$app.themeInUse} />
    {/key}
</Layout.Stack>
