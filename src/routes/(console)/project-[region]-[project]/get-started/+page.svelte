<script lang="ts">
    import { page } from '$app/state';
    import { getPageTitle } from '../store';
    import Onboard from '../overview/onboard.svelte';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>{getPageTitle(page.data?.project?.name, 'Console', resolvedProfile.platform)}</title>
</svelte:head>

<Onboard platforms={page.data.project.platforms} pingCount={page.data.project.pingCount} />
