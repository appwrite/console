<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Header from '$lib/layout/header.svelte';
    import { updateLayout } from '$lib/stores/layout';
    import {
        organization,
        organizationList,
        newOrgModal,
        redirectTo
    } from '$lib/stores/organization';
    import Create from './_createOrganization.svelte';
    import { page } from '$app/stores';
    import { afterNavigate, goto } from '$app/navigation';
    import { onMount } from 'svelte';

    updateLayout({
        title: $organization?.name ?? 'Projects',
        level: 0
    });

    onMount(async () => {
        if ($page.url.pathname === '/console' && !$newOrgModal) {
            const destination = await redirectTo();
            await goto(destination);
        }
    });

    afterNavigate(async () => {
        if ($page.url.pathname === '/console' && !$newOrgModal) {
            console.log('test');
            const destination = await redirectTo();
            await goto(destination);
        }
    });
</script>

<Shell showSideNavigation={!$page?.params.organization}>
    <svelte:fragment slot="header">
        <Header />
    </svelte:fragment>
    <svelte:fragment slot="side">
        {#if !$page?.params.organization}
            <SideNavigation />
        {/if}
    </svelte:fragment>
    <slot />
    <footer class="main-footer" />
</Shell>

{#if $newOrgModal}
    <Create bind:show={$newOrgModal} closable={!$organizationList?.total} />
{/if}
