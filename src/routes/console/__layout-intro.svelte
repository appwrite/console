<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import Header from '$lib/layout/header.svelte';
</script>

<Shell>
    <svelte:fragment slot="header">
        <Header />
    </svelte:fragment>
    <slot />
    <footer class="main-footer" />
</Shell>
