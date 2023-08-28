<script lang="ts">
    import { timeFromNow } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';

    export let deployment: Models.Deployment;
</script>

{timeFromNow(deployment.$updatedAt)}
{#if deployment.providerCommitAuthor}
    by <a
        class="u-underline u-cursor-pointer"
        target="_blank"
        href={deployment.providerCommitAuthorUrl}>{deployment.providerCommitAuthor}</a>
{/if}
