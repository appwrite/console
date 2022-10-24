<script lang="ts">
    import { user } from './store';
</script>

<svelte:head>
    <title>User - Appwrite</title>
</svelte:head>

{#if $user}
    <slot />
{/if}
