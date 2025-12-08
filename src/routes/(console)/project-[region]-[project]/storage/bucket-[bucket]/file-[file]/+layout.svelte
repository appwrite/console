<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import { page } from '$app/state';
    import { getPageTitle } from '../../../store';
</script>

<svelte:head>
    <title>{getPageTitle(page.data?.project?.name, 'File', resolvedProfile.platform)}</title>
</svelte:head>

<slot />
