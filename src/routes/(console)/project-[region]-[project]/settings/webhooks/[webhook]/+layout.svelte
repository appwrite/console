<script>
    import { resolvedProfile } from '$lib/profiles/index.svelte';
</script>

<svelte:head>
    <title>Webhook - {resolvedProfile.platform}</title>
</svelte:head>

<slot />
