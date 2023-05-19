<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { INTERVAL } from '$lib/constants';
    import { Logs } from '$lib/layout';
    import Footer from '$lib/layout/footer.svelte';
    import Header from '$lib/layout/header.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Shell from '$lib/layout/shell.svelte';
    import { feedback } from '$lib/stores/app';
    import { log } from '$lib/stores/logs';
    import { newOrgModal } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import { loading } from '../store';
    import Create from './createOrganization.svelte';

    import { goto } from '$app/navigation';

    import { addSubPanel } from '$lib/commandCenter/subPanels';
    import { registerCommands, CommandCenter } from '$lib/commandCenter';
    import { AI } from '$lib/commandCenter/panels';

    $: $registerCommands([
        {
            label: 'Ask AI',
            callback: () => {
                addSubPanel({
                    name: 'Ask AI',
                    component: AI
                });
            },
            keys: ['a', 'i']
        },
        {
            label: 'Go to Account',
            callback: () => {
                goto('/console/account');
            },
            keys: ['a'],
            ctrl: true,
            shift: true
        },
        {
            label: 'Go to Home',
            callback: () => {
                goto('/console');
            },
            keys: ['g', 'h']
        }
    ]);

    onMount(() => {
        loading.set(false);

        setInterval(() => {
            checkForFeedback(INTERVAL);
        }, INTERVAL);
    });

    function checkForFeedback(interval: number) {
        const minutes = interval / 60000;
        feedback.increaseElapsed(minutes);
        const hours = Math.floor($feedback.elapsed / 60);
        if (hours >= 1 && hours < 10 && $feedback.visualized < 1) {
            feedback.toggleNotification();
            feedback.switchType('nps');
        } else if (hours >= $feedback.visualized * 10) {
            feedback.toggleNotification();
            feedback.switchType('nps');
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

<CommandCenter />

<Shell
    showSideNavigation={$page.url.pathname !== '/console' &&
        !$page?.params.organization &&
        !$page.url.pathname.includes('/console/account') &&
        !$page.url.pathname.includes('/console/onboarding')}>
    <Header slot="header" />
    <SideNavigation slot="side" />
    <slot />
    <Footer slot="footer" />
</Shell>

{#if $wizard.show && $wizard.component}
    <svelte:component this={$wizard.component} />
{/if}

<Create bind:show={$newOrgModal} />

{#if $log.show}
    <Logs />
{/if}
