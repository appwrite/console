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
    import { afterNavigate, beforeNavigate } from '$app/navigation';
    import { onMount } from 'svelte';
    import { wizard } from '$lib/stores/wizard';
    import { Logs } from '$lib/layout';
    import { log } from '$lib/stores/logs';

    updateLayout({
        title: $organization?.name ?? '',
        level: 0
    });

    onMount(async () => {
        if ($page.url.pathname === '/console' && !$newOrgModal) {
            await redirectTo();
        }
    });

    afterNavigate(async () => {
        if ($page.url.pathname === '/console' && !$newOrgModal) {
            await redirectTo();
        }
    });

    beforeNavigate(() => {
        $log.show = false;
    });

    $: if (!$log.show) {
        $log.data = null;
        $log.func = null;
    }
</script>

<svelte:head>
    <title>Console - Appwrite</title>
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

{#if $log.show}
    <Logs />
{/if}
