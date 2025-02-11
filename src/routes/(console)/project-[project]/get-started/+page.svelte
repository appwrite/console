<script lang="ts">
    import { page } from '$app/stores';
    import Onboard from '../overview/onboard.svelte';

    $: projectId = $page.params.project;
</script>

<svelte:head>
    <title>Console - Appwrite</title>
</svelte:head>

<Onboard {projectId} hasPlatforms={$page.data.project.platforms.length > 0} />
