<script lang="ts">
    import Shell from '$lib/layout/shell.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Header from '$lib/layout/header.svelte';
    import { newOrgModal } from '$lib/stores/organization';
    import Create from './createOrganization.svelte';
    import { page } from '$app/stores';
    import { beforeNavigate } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';
    import { Logs } from '$lib/layout';
    import { log } from '$lib/stores/logs';
    import { onMount } from 'svelte';
    import { loading } from '../store';
    import { feedback } from '$lib/stores/app';

    onMount(() => {
        loading.set(false);
        const interval = 60000;
        checkForFeedback(interval);

        setInterval(() => {
            checkForFeedback(interval);
        }, interval);
    });

    function checkForFeedback(interval: number) {
        feedback.setElapsed($feedback.elapsed + interval);
        const minutes = $feedback.elapsed / 60000;
        if (minutes < 60) {
            feedback.toggleNotification();
        } else if (minutes > 60 && $feedback.visualized === 0) {
            feedback.toggleNotification();
        } else if (((minutes - 60) / 10) % 60 >= $feedback.visualized) {
            feedback.toggleNotification();
        }
    }

    beforeNavigate(() => {
        $log.show = false;
    });

    $: if (!$log.show) {
        $log.data = null;
        $log.func = null;
    }
</script>

<Shell
    showSideNavigation={$page.url.pathname !== '/console' &&
        !$page?.params.organization &&
        !$page.url.pathname.includes('/console/account') &&
        !$page.url.pathname.includes('/console/onboarding')}>
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

<Create bind:show={$newOrgModal} />

{#if $log.show}
    <Logs />
{/if}
