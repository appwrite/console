<script lang="ts">
    import { page } from '$app/state';
    import Onboard from '../overview/onboard.svelte';

    $: projectId = page.params.project;
</script>

<svelte:head>
    <title>Console - Appwrite</title>
</svelte:head>

<Onboard
    {projectId}
    platforms={page.data.project.platforms}
    pingCount={page.data.project.pingCount} />
