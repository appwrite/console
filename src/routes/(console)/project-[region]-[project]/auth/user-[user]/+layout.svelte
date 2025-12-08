<script>
    import { page } from '$app/state';
    import { getPageTitle } from '../../store';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>{getPageTitle(page.data?.project?.name, 'User', resolvedProfile.platform)}</title>
</svelte:head>

<slot />
