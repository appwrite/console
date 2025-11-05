<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte.ts';
</script>

<svelte:head>
    <title>Provider - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
