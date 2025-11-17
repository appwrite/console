<script lang="ts">
    import { page } from '$app/state';
    import Onboard from '../overview/onboard.svelte';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>Console - {resolvedProfile.platform}</title>
</svelte:head>

<Onboard platforms={page.data.project.platforms} pingCount={page.data.project.pingCount} />
