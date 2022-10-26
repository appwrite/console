<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Header from '$lib/layout/header.svelte';
    import { organizationList, newOrgModal } from '$lib/stores/organization';
    import Create from './createOrganization.svelte';
    import { page } from '$app/stores';
    import { beforeNavigate } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import { Logs } from '$lib/layout';
    import { log } from '$lib/stores/logs';
    import { onMount } from 'svelte';
    import { loading } from '../store';

    onMount(() => {
        loading.set(false);
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
