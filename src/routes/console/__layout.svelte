<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Header from '$lib/layout/header.svelte';
    import { updateLayout } from '$lib/stores/layout';
    import { organization, newOrgModal } from './store';
    import Create from './_createOrganization.svelte';

    updateLayout({
        title: $organization.name ?? 'Projects',
        level: 0
    });
</script>

<Shell showSideNavigation>
    <svelte:fragment slot="header">
        <Header />
    </svelte:fragment>
    <svelte:fragment slot="side">
        <SideNavigation />
    </svelte:fragment>
    <slot />
    <footer class="main-footer" />
</Shell>

{#if $newOrgModal}
    <Create bind:show={$newOrgModal} />
{/if}
