<script lang="ts">
    import { page } from '$app/stores';
    import { INTERVAL } from '$lib/constants';
    import { Logs } from '$lib/layout';
    import Footer from '$lib/layout/footer.svelte';
    import Header from '$lib/layout/header.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Shell from '$lib/layout/shell.svelte';
    import { app, feedback } from '$lib/stores/app';
    import { log } from '$lib/stores/logs';
    import { newOrgModal } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import { loading, requestedMigration } from '../store';
    import Create from './createOrganization.svelte';

    import { goto } from '$app/navigation';

    import { CommandCenter, registerCommands, registerSearchers } from '$lib/commandCenter';
    import { AIPanel, OrganizationsPanel, ProjectsPanel } from '$lib/commandCenter/panels';
    import { orgSearcher, projectsSearcher } from '$lib/commandCenter/searchers';
    import { addSubPanel } from '$lib/commandCenter/subPanels';
    import { addNotification } from '$lib/stores/notifications';
    import { openMigrationWizard } from './(migration-wizard)';

    $: $registerCommands([
        {
            label: 'Ask AI',
            callback: () => {
                addSubPanel(AIPanel);
            },
            keys: ['a', 'i'],
            icon: 'light-bulb'
        },
        {
            label: 'Go to account',
            callback: () => {
                goto('/console/account');
            },
            keys: ['i'],
            group: 'navigation'
        },
        {
            label: 'Find an organization',
            callback: () => {
                addSubPanel(OrganizationsPanel);
            },
            group: 'organizations',
            icon: 'search',
            keys: ['f', 'o']
        },
        {
            label: 'Find a project',
            callback: () => {
                addSubPanel(ProjectsPanel);
            },
            keys: ['f', 'p'],
            group: 'projects',
            icon: 'search'
        },
        {
            label: 'Create new organization',
            callback: () => {
                newOrgModal.set(true);
            },
            keys: ['c', 'o'],
            group: 'organizations'
        },
        {
            label: 'Go to home',
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
        },
        {
            label: 'Contact support',
            callback: () => {
                window.open('https://appwrite.io/support', '_blank');
            },
            group: 'help',
            icon: 'question-mark-circle'
        },
        {
            label: 'Send feedback',
            callback: () => {
                feedback.toggleFeedback();
            },
            group: 'help',
            icon: 'annotation'
        },
        {
            label: 'Join Discord community',
            callback: () => {
                window.open('https://appwrite.io/discord', '_blank');
            },
            group: 'help',
            icon: 'discord'
        },
        {
            label: 'Toggle theme',
            callback: () => {
                if ($app.theme === 'auto') {
                    $app.theme = 'light';
                } else if ($app.theme === 'light') {
                    $app.theme = 'dark';
                } else {
                    $app.theme = 'auto';
                }
                addNotification({
                    title: 'Theme changed',
                    message: `Theme changed to ${$app.theme}`,
                    type: 'success'
                });
            },
            group: 'misc',
            icon: 'switch-horizontal'
        }
    ]);
    let isOpen = false;

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

    $: if (!$log.show) {
        $log.data = null;
        $log.func = null;
    }

    $: if ($requestedMigration) {
        openMigrationWizard();
    }

    $registerSearchers(orgSearcher, projectsSearcher);
</script>

<CommandCenter />

<Shell
    bind:isOpen
    showSideNavigation={$page.url.pathname !== '/console' &&
        !$page?.params.organization &&
        !$page.url.pathname.includes('/console/account') &&
        !$page.url.pathname.includes('/console/card') &&
        !$page.url.pathname.includes('/console/onboarding')}>
    <Header slot="header" />
    <SideNavigation slot="side" bind:isOpen />
    <slot />
    <Footer slot="footer" />
</Shell>

{#if $wizard.show && $wizard.component}
    <svelte:component this={$wizard.component} />
{:else if $wizard.cover}
    <svelte:component this={$wizard.cover} />
{/if}

<Create bind:show={$newOrgModal} />

{#if $log.show}
    <Logs />
{/if}
