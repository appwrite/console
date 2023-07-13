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
    import { requestedMigration } from '../store';

    import { goto } from '$app/navigation';

    import { CommandCenter, registerCommands } from '$lib/commandCenter';
    import { AI, Organizations } from '$lib/commandCenter/panels';
    import { addSubPanel } from '$lib/commandCenter/subPanels';

    $: $registerCommands([
        {
            label: 'Ask AI',
            callback: () => {
                addSubPanel({
                    name: 'Ask the AI',
                    component: AI
                });
            },
            keys: ['a', 'i'],
            icon: 'light-bulb'
        },
        {
            label: 'Go to Account',
            callback: () => {
                goto('/console/account');
            },
            keys: ['i'],
            group: 'navigation'
        },
        {
            label: 'Find an Organization',
            callback: () => {
                addSubPanel({
                    name: 'Find a Organization',
                    component: Organizations
                });
            },
            group: 'organizations',
            icon: 'search'
        },
        {
            label: 'Create new Organization',
            callback: () => {
                newOrgModal.set(true);
            },
            keys: ['c', 'o'],
            group: 'organizations'
        },
        {
            label: 'Go to Home',
            callback: () => {
                goto('/console');
            },
            keys: ['h'],
            group: 'navigation'
        },
        {
            label: 'Open documentation',
            callback: () => {
                window.open('https://appwrite.io/docs', '_blank');
            },
            group: 'help',
            icon: 'book-open'
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
