<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import { page } from '$app/state';
    import { getPageTitle } from '../../../store';
</script>

<svelte:head>
    <title>{getPageTitle(page.data?.project?.name, 'Provider', resolvedProfile.platform)}</title>
</svelte:head>

<slot />
