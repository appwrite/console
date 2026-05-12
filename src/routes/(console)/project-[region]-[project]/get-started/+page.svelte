<script lang="ts">
    import { page } from '$app/state';
    import Onboard from '../overview/onboard.svelte';
</script>

<svelte:head>
    <title>Console - Appwrite</title>
</svelte:head>

<Onboard platforms={page.data.platforms.platforms} pingCount={page.data.project.pingCount} />
