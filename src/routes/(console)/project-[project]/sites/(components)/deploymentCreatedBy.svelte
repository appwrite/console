<script lang="ts">
    import Link from '$lib/elements/link.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let deployment: Models.Deployment;
</script>

{#if deployment.providerCommitAuthor}
    <Typography.Text variant="m-400">
        {timeFromNow(deployment.$updatedAt)} ago by <Link
            href={deployment.providerCommitAuthorUrl}
            external>{deployment.providerCommitAuthor}</Link>
    </Typography.Text>
{:else}
    <Typography.Text variant="m-400">
        {timeFromNow(deployment.$updatedAt)}
    </Typography.Text>
{/if}
