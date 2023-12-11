<script lang="ts">
    import { page } from '$app/stores';
    import { INTERVAL } from '$lib/constants';
    import { Logs } from '$lib/layout';
    import Footer from '$lib/layout/footer.svelte';
    import Header from '$lib/layout/header.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Shell from '$lib/layout/shell.svelte';
    import { app } from '$lib/stores/app';
    import { log } from '$lib/stores/logs';
    import { newOrgModal, organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { afterUpdate, onMount } from 'svelte';
    import { loading, requestedMigration } from '../store';
    import Create from './createOrganization.svelte';
    import {
        showUsageRatesModal,
        checkForUsageLimit,
        checkPaymentAuthorizationRequired,
        calculateTrialDay,
        checkForTrialEnding,
        paymentExpired
    } from '$lib/stores/billing';
    import { goto } from '$app/navigation';
    import { CommandCenter, registerCommands, registerSearchers } from '$lib/commandCenter';
    import { AIPanel, OrganizationsPanel, ProjectsPanel } from '$lib/commandCenter/panels';
    import { orgSearcher, projectsSearcher } from '$lib/commandCenter/searchers';
    import { addSubPanel } from '$lib/commandCenter/subPanels';
    import { addNotification } from '$lib/stores/notifications';
    import { openMigrationWizard } from './(migration-wizard)';
    import { project } from './project-[project]/store';
    import { feedback } from '$lib/stores/feedback';
    import { VARS, hasStripePublicKey, isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { loadStripe } from '@stripe/stripe-js';
    import { stripe } from '$lib/stores/stripe';
    import MobileSupportModal from './wizard/support/mobileSupportModal.svelte';
    import { showSupportModal } from './wizard/support/store';
    import ExcesLimitModal from './organization-[organization]/excesLimitModal.svelte';
    import { showExcess } from './organization-[organization]/store';
    import UsageRates from './wizard/cloudOrganization/usageRates.svelte';
    import { consoleVariables, showPostReleaseModal } from './store';
    import { Query } from '@appwrite.io/console';
    import { headerAlert } from '$lib/stores/headerAlert';
    import MarkedForDeletion from '$lib/components/billing/alerts/markedForDeletion.svelte';
    import PostReleaseModal from './(billing-modal)/postReleaseModal.svelte';
    import TooManyFreOrgs from '$lib/components/billing/alerts/tooManyFreOrgs.svelte';

    function kebabToSentenceCase(str: string) {
        return str
            .split('-')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ');
    }

    const isAssistantEnabled = $consoleVariables?._APP_ASSISTANT_ENABLED === true;

    $: isOnSettingsLayout = $project?.$id
        ? $page.url.pathname.includes(`project-${$project.$id}/settings`)
        : false;

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
                window.open('https://appwrite.io/discord', '_blank');
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
        }),
        // Auth
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
                }) as const
        ),
        // Settings
        {
            label: 'Go to settings overview',

            keys: isOnSettingsLayout ? ['g', 'o'] : undefined,
            callback: () => {
                goto(`/console/project-${$project.$id}/settings`);
            },
            disabled: isOnSettingsLayout && $page.url.pathname.endsWith('settings'),
            group: isOnSettingsLayout ? 'navigation' : 'settings',
            rank: isOnSettingsLayout ? 40 : -1
        },
        {
            label: 'Go to custom domains',

            keys: isOnSettingsLayout ? ['g', 'd'] : undefined,
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/domains`);
            },
            disabled: isOnSettingsLayout && $page.url.pathname.includes('domains'),
            group: isOnSettingsLayout ? 'navigation' : 'settings',
            rank: isOnSettingsLayout ? 30 : -1
        },
        {
            label: 'Go to webhooks',
            keys: isOnSettingsLayout ? ['g', 'w'] : undefined,
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/webhooks`);
            },
            disabled: isOnSettingsLayout && $page.url.pathname.includes('webhooks'),
            group: isOnSettingsLayout ? 'navigation' : 'settings',

            rank: isOnSettingsLayout ? 20 : -1
        },
        {
            label: 'Go to migrations',
            keys: isOnSettingsLayout ? ['g', 'm'] : undefined,
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/migrations`);
            },
            disabled: isOnSettingsLayout && $page.url.pathname.includes('migrations'),
            group: isOnSettingsLayout ? 'navigation' : 'settings',

            rank: isOnSettingsLayout ? 10 : -1
        },
        {
            label: 'Go to SMTP settings',
            keys: isOnSettingsLayout ? ['g', 's'] : undefined,
            callback: () => {
                goto(`/console/project-${$project.$id}/settings/smtp`);
            },
            disabled: isOnSettingsLayout && $page.url.pathname.includes('smtp'),
            group: isOnSettingsLayout ? 'navigation' : 'settings',
            rank: -1
        },
        // Searcher panels
        {
            label: 'Find organizations',
            callback: () => {
                addSubPanel(OrganizationsPanel);
            },
            group: 'organizations',
            rank: -1
        },
        {
            label: 'Find projects',
            callback: () => {
                addSubPanel(ProjectsPanel);
            },
            group: 'projects',
            rank: -1
        }
    ]);
    let isOpen = false;
    let selectedHeaderAlert = headerAlert.get();
    onMount(async () => {
        loading.set(false);
        if (isCloud) {
            checkForFreeOrgOverflow();
            if (!$page.url.pathname.includes('/console/onboarding')) {
                checkForPostReleaseProModal();
            }
        }

        setInterval(() => {
            checkForFeedback(INTERVAL);
        }, INTERVAL);

        if (isCloud && hasStripePublicKey) {
            console.log('Environment is Cloud and Stripe public key deteted');
            $stripe = await loadStripe(VARS.STRIPE_PUBLIC_KEY);
            console.log('Stripe should have been loading', $stripe);
        } else {
            console.log('Environment is not Cloud or Stripe public key not deteted');
            console.log('isCloud:', isCloud);
            console.log('hasStripePublicKey:', hasStripePublicKey);
            console.log('Stripe key:', VARS.STRIPE_PUBLIC_KEY);
        }
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

    async function checkForFreeOrgOverflow() {
        const orgs = await sdk.forConsole.teams.list([Query.equal('billingPlan', 'tier-0')]);
        if (orgs?.teams?.length > 1) {
            headerAlert.add({
                id: 'freeOrgOverflow',
                component: TooManyFreOrgs,
                show: true,
                importance: 10
            });
        }
    }

    organization.subscribe(async (org) => {
        if (!org) return;
        if (isCloud) {
            calculateTrialDay(org);
            checkForTrialEnding(org);
            await paymentExpired(org);
            checkForUsageLimit(org);
            if (org?.markedForDeletion) {
                headerAlert.add({
                    id: 'markedForDeletion',
                    component: MarkedForDeletion,
                    show: true,
                    importance: 5
                });
            }
            await checkPaymentAuthorizationRequired(org);
        }
    });

    function checkForPostReleaseProModal() {
        const modalTime = localStorage.getItem('postReleaseProModal');
        const now = Date.now();
        // show the modal if it was never shown
        if (!modalTime) {
            localStorage.setItem('postReleaseProModal', Date.now().toString());
            showPostReleaseModal.set(true);
        } else {
            const interval = 5 * 24 * 60 * 60 * 1000;
            const sinceLastModal = now - parseInt(modalTime);
            // show the modal if it was shown more than 5 days ago
            if (sinceLastModal > interval) {
                localStorage.setItem('postReleaseProModal', Date.now().toString());
                showPostReleaseModal.set(true);
            }
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

    afterUpdate(() => {
        selectedHeaderAlert = headerAlert.get();
    });
</script>

<CommandCenter />

<Shell
    bind:isOpen
    showSideNavigation={$page.url.pathname !== '/console' &&
        !$page?.params.organization &&
        !$page.url.pathname.includes('/console/account') &&
        !$page.url.pathname.includes('/console/card') &&
        !$page.url.pathname.includes('/console/onboarding')}>
    <svelte:fragment slot="alert">
        {#if selectedHeaderAlert?.show}
            <svelte:component this={selectedHeaderAlert.component} />
        {/if}
    </svelte:fragment>
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

{#if $showSupportModal}
    <MobileSupportModal bind:show={$showSupportModal}></MobileSupportModal>
{/if}

{#if isCloud && $showExcess}
    <ExcesLimitModal bind:show={$showExcess}></ExcesLimitModal>
{/if}
{#if isCloud && $showUsageRatesModal}
    <UsageRates bind:show={$showUsageRatesModal} tier={$organization?.billingPlan} />
{/if}
{#if isCloud && $showPostReleaseModal && !$page.url.pathname.includes('/console/onboarding')}
    <!-- {#if true} -->
    <PostReleaseModal show={true} />
{/if}
