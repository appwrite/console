<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Link } from '$lib/elements';
    import { Alert } from '@appwrite.io/pink-svelte';

    export let product: 'site' | 'function';
</script>

{#if product === 'site'}
    <Alert.Inline status="info" title="Your logs are disabled">
        To view logs and errors, enable them in your
        <Link
            href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/settings`}>
            site settings</Link
        >.
    </Alert.Inline>
{:else if product === 'function'}
    <Alert.Inline status="info" title="Your execution logs are disabled">
        To view execution logs and errors, enable them in your
        <Link
            href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/settings`}>
            function settings</Link
        >.
    </Alert.Inline>
{/if}
