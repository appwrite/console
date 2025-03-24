<script lang="ts">
    import Link from '$lib/elements/link.svelte';
    import { capitalize } from '$lib/helpers/string';
    import type { Models } from '@appwrite.io/console';
    import { timeFromNow } from '$lib/helpers/date';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let deployment: Models.Deployment;
</script>

<p>
    <DualTimeView time={deployment.$updatedAt}>
        {deployment.providerCommitAuthor
            ? timeFromNow(deployment.$updatedAt)
            : capitalize(timeFromNow(deployment.$updatedAt))}
    </DualTimeView>

    {#if deployment.providerCommitAuthor}
        by
        <Link href={deployment.providerCommitAuthorUrl} external>
            {deployment.providerCommitAuthor}
        </Link>
    {/if}
</p>
