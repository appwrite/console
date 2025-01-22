<script lang="ts">
    import { page } from '$app/stores';
    import { project } from '../store';
    import Onboard from '../overview/onboard.svelte';

    $: projectId = $page.params.project;
</script>

<svelte:head>
    <title>Console - Appwrite</title>
</svelte:head>

<Onboard {projectId} hasPlatforms={$project.platforms.length > 0} />
