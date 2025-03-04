<script lang="ts">
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { capitalize } from '$lib/helpers/string';
    import { Tooltip } from '@appwrite.io/pink-svelte';
    import Link from '$lib/elements/link.svelte';
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
