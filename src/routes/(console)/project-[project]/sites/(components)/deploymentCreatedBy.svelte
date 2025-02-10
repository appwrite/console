<script lang="ts">
    import Link from '$lib/elements/link.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import { capitalize } from '$lib/helpers/string';
    import type { Models } from '@appwrite.io/console';

    export let deployment: Models.Deployment;
</script>

<p>
    {#if deployment.providerCommitAuthor}
        <span title={deployment.$updatedAt}>
            {capitalize(timeFromNow(deployment.$updatedAt))}
        </span>
        by <Link href={deployment.providerCommitAuthorUrl} external
            >{deployment.providerCommitAuthor}</Link>
    {:else}
        <span title={deployment.$updatedAt}>
            {capitalize(timeFromNow(deployment.$updatedAt))}
        </span>
    {/if}
</p>
