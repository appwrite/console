<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>User - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
