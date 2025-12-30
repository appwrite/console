<script lang="ts">
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import { getPageTitle } from '../../store';
    import { page } from '$app/state';
</script>

<svelte:head>
    <title>{getPageTitle(page.data?.project?.name, 'API Keys', resolvedProfile.platform)}</title>
</svelte:head>

<slot />
