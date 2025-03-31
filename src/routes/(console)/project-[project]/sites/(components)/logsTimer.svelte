<script lang="ts">
    import { timer } from '$lib/actions/timer';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';

    import { Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';

    export let status: string;
    export let deployment: Models.Deployment;
</script>

<Layout.Stack direction="row" alignItems="center" inline>
    {#if ['processing'].includes(status)}
        <Typography.Code color="--fgcolor-neutral-secondary">
            <Layout.Stack direction="row" alignItems="center" inline>
                0s
                <Spinner size="s" />
            </Layout.Stack>
        </Typography.Code>
    {:else if ['building'].includes(status)}
        <Typography.Code color="--fgcolor-neutral-secondary">
            <Layout.Stack direction="row" alignItems="center" inline>
                <p use:timer={{ start: deployment.$createdAt }} />
                <Spinner size="s" />
            </Layout.Stack>
        </Typography.Code>
    {:else}
        <Typography.Code color="--fgcolor-neutral-secondary">
            {formatTimeDetailed(deployment.buildDuration)}
        </Typography.Code>
    {/if}
</Layout.Stack>
