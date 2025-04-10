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
    import { Badge, Card, Layout, Logs, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import LogsTimer from './logsTimer.svelte';

    let {
        deployment = $bindable(),
        hideTitle = false,
        hideScrollButtons = false,
        height = 'auto',
        fullHeight = false,
        emptyCopy = 'No logs available'
    }: {
        deployment: Models.Deployment;
        hideTitle?: boolean;
        hideScrollButtons?: boolean;
        height?: string;
        fullHeight?: boolean;
        emptyCopy?: string;
    } = $props();

    function setCopy() {
        if (deployment.status === 'failed') {
            return 'Your deployment has failed.';
        } else if (deployment.status === 'building') {
            //Do not remove empty space before the string it's an invisible character
            return '[37mPreparing for build ... [0m\n';
        } else if (deployment.status === 'waiting') {
            return '[37mPreparing for build ... [0m\n';
        } else if (deployment.status === 'processing') {
            return '[37mPreparing for build ... [0m\n';
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

    {#if ['waiting', 'processing'].includes(deployment.status) || (deployment.status === 'building' && !deployment?.buildLogs?.length)}
        <Card.Base variant="secondary">
            <Layout.Stack direction="row" justifyContent="center" gap="s">
                <Spinner /> Waiting for build to start...
            </Layout.Stack>
        </Card.Base>
    {:else}
        {#key deployment.buildLogs}
            <Logs
                {fullHeight}
                {height}
                showScrollButton={!hideScrollButtons}
                logs={deployment.buildLogs || setCopy()}
                bind:theme={$app.themeInUse} />
        {/key}
    {/if}
</Layout.Stack>
