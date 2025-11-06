<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>Message - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
