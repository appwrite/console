<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>Sites - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
