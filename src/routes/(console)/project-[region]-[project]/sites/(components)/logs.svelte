<script module lang="ts">
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
    import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
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

    let effectiveStatus = $derived(
        getEffectiveBuildStatus(deployment.status, deployment.$createdAt, $regionalConsoleVariables)
    );

    function setCopy() {
        if (effectiveStatus === 'failed') {
            return 'Your deployment has failed.';
        } else if (effectiveStatus === 'building') {
            //Do not remove empty space before the string it's an invisible character
            return '[37mPreparing for build ... [0m\n';
        } else if (effectiveStatus === 'waiting') {
            return '[37mPreparing for build ... [0m\n';
        } else if (effectiveStatus === 'processing') {
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
                    content={capitalize(effectiveStatus)}
                    size="xs"
                    variant="secondary"
                    type={badgeTypeDeployment(effectiveStatus)} />
            </Layout.Stack>
            <LogsTimer status={effectiveStatus} {deployment} />
        </Layout.Stack>
    {/if}

    {#if ['waiting', 'processing'].includes(effectiveStatus) || (effectiveStatus === 'building' && !deployment?.buildLogs?.length)}
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
