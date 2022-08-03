<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import Header from '$lib/layout/header.svelte';
    import { updateLayout } from '$lib/stores/layout';

    updateLayout({
        title: 'Projects',
        level: 0
    });
</script>

<Shell>
    <svelte:fragment slot="header">
        <Header />
    </svelte:fragment>
    <slot />
    <footer class="main-footer" />
</Shell>
