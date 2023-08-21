<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
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
    import { AIPanel } from '$lib/commandCenter/panels';
    import { orgSearcher, projectsSearcher } from '$lib/commandCenter/searchers';
    import { addSubPanel } from '$lib/commandCenter/subPanels';
    import { addNotification } from '$lib/stores/notifications';
    import { openMigrationWizard } from './(migration-wizard)';
    import { project } from './project-[project]/store';
    import { sdk } from '$lib/stores/sdk';

    function kebabToSentenceCase(str: string) {
        return str
            .split('-')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ');
    }

    let isAssistantEnabled = false;
    onMount(async () => {
        const vars = sdk.forConsole.console.variables();
        isAssistantEnabled = vars._APP_ASSISTANT_ENABLED === true;
    });
    $: $registerCommands([
        {
            label: 'Go to projects',
            callback: () => {
                goto('/console');
            },
            keys: ['g', 'p'],
            group: 'navigation',
            disabled:
                $page.url.pathname.includes('/console/organization-') &&
                !$page.url.pathname.endsWith('/members') &&
                !$page.url.pathname.endsWith('/settings'),
            rank: -1
        },
        {
            label: 'Ask the AI',
            callback: () => {
                addSubPanel(AIPanel);
            },
            keys: ['a', 'i'],
            icon: 'sparkles',
            disabled: !isAssistantEnabled
        },
        {
            label: 'Go to account',
            callback: () => {
                goto('/console/account');
            },
            keys: ['i'],
            group: 'navigation',
            rank: -2
        },
        {
            label: 'Create new organization',
            callback: () => {
                newOrgModal.set(true);
            },
            keys: ['c', 'o'],
            group: 'organizations'
        },
        ...[
            'users-limit',
            'session-length',
            'sessions-limit',
            'password-history',
            'password-dictionary',
            'personal-data'
        ].map(
            (heading) =>
                ({
                    label: kebabToSentenceCase(heading),
                    async callback() {
                        await goto(`/console/project-${$project.$id}/auth/security#${heading}`);
                        scrollBy({ top: -100 });
                    },
                    group: 'security',
                    icon: 'pencil'
                } as const)
        ),

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
        ...(['auto', 'dark', 'light'] as const).map((theme) => {
            return {
                label: `Set theme to ${theme}`,
                callback: () => {
                    $app.theme = theme;
                    addNotification({
                        title: 'Theme changed',
                        message: `Theme changed to ${$app.theme}`,
                        type: 'success'
                    });
                },
                group: 'misc',
                icon: 'switch-horizontal',
                keys: ['t', theme[0]]
            } as const;
        })
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

    beforeNavigate(() => {
        $log.show = false;
    });

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
{/if}

<Create bind:show={$newOrgModal} />

{#if $log.show}
    <Logs />
{/if}
