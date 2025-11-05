<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte.ts';
</script>

<svelte:head>
    <title>User - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
