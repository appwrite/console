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
    import { capitalize } from '$lib/helpers/string';
    import { app } from '$lib/stores/app';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Logs, Typography } from '@appwrite.io/pink-svelte';
    import LogsTimer from './logsTimer.svelte';

    export let site: Models.Site;
    export let deployment: Models.Deployment;
    export let hideTitle = false;
    export let hideScrollButtons = false;
    export let height = 'auto';
    export let fullHeight = false;
    export let emptyCopy = 'No logs available';

    function setCopy() {
        if (deployment.status === 'failed') {
            return 'Your deployment has failed.';
        } else if (deployment.status === 'building') {
            return 'Build is starting.';
        } else if (deployment.status === 'processing') {
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
                    content={capitalize(deployment.status)}
                    size="xs"
                    variant="secondary"
                    type={badgeTypeDeployment(deployment.status)} />
            </Layout.Stack>
            <LogsTimer status={deployment.status} {deployment} />
        </Layout.Stack>
    {/if}
    {#key deployment.buildLogs}
        <Logs
            {fullHeight}
            {height}
            showScrollButton={!hideScrollButtons}
            logs={deployment.buildLogs || setCopy()}
            bind:theme={$app.themeInUse} />
    {/key}
</Layout.Stack>
