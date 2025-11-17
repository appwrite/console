<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>Team - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
