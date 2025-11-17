<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>Provider - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
