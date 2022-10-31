<script lang="ts">
    import { collection } from './store';
</script>

<svelte:head>
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />
