<script lang="ts">
    import Link from '$lib/elements/link.svelte';
    import type { Models } from '@appwrite.io/console';
    import DualTimeView from '$lib/components/dualTimeView.svelte';

    export let deployment: Models.Deployment;
</script>

<p>
    <DualTimeView time={deployment.$updatedAt} />
    {#if deployment.providerCommitAuthor}
        by
        <Link href={deployment.providerCommitAuthorUrl} external>
            {deployment.providerCommitAuthor}
        </Link>
    {/if}
</p>
