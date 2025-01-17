<script lang="ts">
    import Link from '$lib/elements/link.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import { capitalize } from '$lib/helpers/string';
    import type { Models } from '@appwrite.io/console';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let deployment: Models.Deployment;
</script>

{#if deployment.providerCommitAuthor}
    <Typography.Text variant="m-400">
        <span title={deployment.$updatedAt}>
            {capitalize(timeFromNow(deployment.$updatedAt))}
        </span>
        ago by <Link href={deployment.providerCommitAuthorUrl} external
            >{deployment.providerCommitAuthor}</Link>
    </Typography.Text>
{:else}
    <Typography.Text variant="m-400">
        <span title={deployment.$updatedAt}>
            {capitalize(timeFromNow(deployment.$updatedAt))}
        </span>
    </Typography.Text>
{/if}
