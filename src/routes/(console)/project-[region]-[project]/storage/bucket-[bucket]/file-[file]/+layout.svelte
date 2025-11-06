<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>File - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
