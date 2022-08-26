<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Header from '$lib/layout/header.svelte';
    import { updateLayout } from '$lib/stores/layout';
    import {
        organization,
        organizationList,
        newOrgModal
    } from './organization-[organization]/store';
    import Create from './_createOrganization.svelte';
    import { page } from '$app/stores';
    import { afterNavigate, goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let closable = true;

    updateLayout({
        title: $organization?.name ?? 'Projects',
        level: 0
    });

    onMount(async () => {
        if ($page.url.pathname === '/console') {
            await pageLoad();
        }
    });

    afterNavigate(async () => {
        if ($page.url.pathname === '/console') {
            await pageLoad();
        }
    });

    const pageLoad = async () => {
        if (!$organization) {
            await organizationList.load();
            if ($organizationList?.total) {
                await organization.load($organizationList.teams[0].$id);
                await goto(`/console/organization-${$organization.$id}`);
            } else {
                closable = false;
                newOrgModal.set(true);
            }
        } else {
            await goto(`/console/organization-${$organization.$id}`);
        }
    };
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
    <Create bind:show={$newOrgModal} {closable} />
{/if}
