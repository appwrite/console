<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Header from '$lib/layout/header.svelte';
    import { organizationList, newOrgModal, redirectTo } from '$lib/stores/organization';
    import Create from './_createOrganization.svelte';
    import { page } from '$app/stores';
    import { afterNavigate } from '$app/navigation';
    import { onMount } from 'svelte';
    import { wizard } from '$lib/stores/wizard';

    onMount(async () => {
        if ($page.url.pathname === '/console' && !$newOrgModal) {
            return await redirectTo();
        }
    });

    afterNavigate(async () => {
        if ($page.url.pathname === '/console' && !$newOrgModal) {
            return await redirectTo();
        }
    });
</script>

<svelte:head>
    <title>Appwrite - Console</title>
</svelte:head>

<Shell
    showSideNavigation={$page.url.pathname !== '/console' &&
        !$page?.params.organization &&
        !$page.url.pathname.includes('/console/account')}>
    <svelte:fragment slot="header">
        <Header />
    </svelte:fragment>
    <svelte:fragment slot="side">
        <SideNavigation />
    </svelte:fragment>
    <slot />
    <footer class="main-footer" />
</Shell>

{#if $wizard.show && $wizard.component}
    <svelte:component this={$wizard.component} />
{/if}

{#if $newOrgModal}
    <Create bind:show={$newOrgModal} closable={!!$organizationList?.total} />
{/if}
