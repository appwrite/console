<script lang="ts">
    import LL from '$i18n/i18n-svelte';
</script>

<svelte:head>
    <title>{$LL.console.project.title.team()} - Appwrite</title>
</svelte:head>

<slot />
