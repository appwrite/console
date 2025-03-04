<script lang="ts">
    import Link from '$lib/elements/link.svelte';
    import { capitalize } from '$lib/helpers/string';
    import type { Models } from '@appwrite.io/console';
    import { Tooltip } from '@appwrite.io/pink-svelte';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let deployment: Models.Deployment;
</script>

<p>
    {#if deployment.providerCommitAuthor}
        <Tooltip>
            <span>
                {capitalize(timeFromNow(deployment.$updatedAt))}
            </span>
            <span slot="tooltip">{toLocaleDateTime(deployment.$updatedAt)}</span>
        </Tooltip>
        by <Link href={deployment.providerCommitAuthorUrl} external
            >{deployment.providerCommitAuthor}</Link>
    {:else}
        <DualTimeView time={deployment.$updatedAt} />
    {/if}
</p>
