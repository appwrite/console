<script lang="ts">
    import { timer } from '$lib/actions/timer';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { getEffectiveBuildStatus, getBuildTimeoutSeconds } from '$lib/helpers/buildTimeout';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import type { Models } from '@appwrite.io/console';

    import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';

    let { status, deployment }: { status: string; deployment: Models.Deployment } = $props();

    // mmoize timeout value to avoid recalculating on every render
    let timeoutSeconds = $derived(getBuildTimeoutSeconds($regionalConsoleVariables));
    let effectiveStatus = $derived(
        getEffectiveBuildStatus(status, deployment.$createdAt, timeoutSeconds)
    );
</script>

<Layout.Stack direction="row" alignItems="center" inline>
    {#if ['processing', 'building'].includes(effectiveStatus)}
        <Typography.Code color="--fgcolor-neutral-secondary">
            <Layout.Stack direction="row" alignItems="center" inline>
                <p use:timer={{ start: deployment.$createdAt }}></p>
                <Spinner size="s" />
            </Layout.Stack>
        </Typography.Code>
    {:else}
        <Typography.Code color="--fgcolor-neutral-secondary">
            {formatTimeDetailed(deployment.buildDuration)}
        </Typography.Code>
    {/if}
</Layout.Stack>
