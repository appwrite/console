<script lang="ts">
    import { page } from '$app/stores';
    import { BillingPlan, INTERVAL } from '$lib/constants';
    import { Logs } from '$lib/layout';
    import Footer from '$lib/layout/footer.svelte';
    import Header from '$lib/layout/header.svelte';
    import SideNavigation from '$lib/layout/navigation.svelte';
    import Shell from '$lib/layout/shell.svelte';
    import { app } from '$lib/stores/app';
    import { log } from '$lib/stores/logs';
    import { newOrgModal, organization, type Organization } from '$lib/stores/organization';
    import { database, checkForDatabaseBackupPolicies } from '$lib/stores/database';
    import { wizard } from '$lib/stores/wizard';
    import { afterUpdate, onMount } from 'svelte';
    import { loading } from '$routes/store';
    import { requestedMigration } from '../store';
    import Create from './createOrganization.svelte';
    import {
        calculateTrialDay,
        checkForMandate,
        checkForMarkedForDeletion,
        checkForMissingPaymentMethod,
        checkForNewDevUpgradePro,
        checkForUsageLimit,
        checkPaymentAuthorizationRequired,
        paymentExpired,
        plansInfo,
        showUsageRatesModal
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
    import { hasStripePublicKey, isCloud, VARS } from '$lib/system';
    import { stripe } from '$lib/stores/stripe';
    import MobileSupportModal from './wizard/support/mobileSupportModal.svelte';
    import { showSupportModal } from './wizard/support/store';
    import { activeHeaderAlert, consoleVariables } from './store';
    import { headerAlert } from '$lib/stores/headerAlert';
    import { UsageRates } from '$lib/components/billing';
    import { base } from '$app/paths';
    import { canSeeProjects } from '$lib/stores/roles';
    import { BottomModalAlert } from '$lib/components';
    import { browser, dev } from '$app/environment';
    import { user } from '$lib/stores/user';
    import { loadReoScript, type Reo, type ReoUserIdentifyConfig } from 'reodotdev';

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
            label: 'Go to Projects',
            callback: () => {
                goto(base);
            },
            keys: ['g', 'p'],
            group: 'navigation',
            disabled:
                ($page.url.pathname.includes('/console/organization-') &&
                    !$page.url.pathname.endsWith('/members') &&
                    !$page.url.pathname.endsWith('/settings')) ||
                !$canSeeProjects,
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
            label: 'Create new organization',
            callback: () => {
                isCloud ? goto(`${base}/create-organization`) : newOrgModal.set(true);
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
                        await goto(`${base}/project-${$project.$id}/auth/security#${heading}`);
                        scrollBy({ top: -100 });
                    },
                    disabled: !$project?.$id,
                    group: 'security',
                    icon: 'pencil'
                }) as const
        ),
        // Settings
        {
            label: 'Go to settings overview',

            keys: isOnSettingsLayout ? ['g', 'o'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.$id}/settings`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && $page.url.pathname.endsWith('settings')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',
            rank: isOnSettingsLayout ? 40 : -1
        },
        {
            label: 'Go to custom domains',

            keys: isOnSettingsLayout ? ['g', 'd'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.$id}/settings/domains`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && $page.url.pathname.includes('domains')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',
            rank: isOnSettingsLayout ? 30 : -1
        },
        {
            label: 'Go to webhooks',
            keys: isOnSettingsLayout ? ['g', 'w'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.$id}/settings/webhooks`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && $page.url.pathname.includes('webhooks')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',

            rank: isOnSettingsLayout ? 20 : -1
        },
        {
            label: 'Go to migrations',
            keys: isOnSettingsLayout ? ['g', 'm'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.$id}/settings/migrations`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && $page.url.pathname.includes('migrations')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',

            rank: isOnSettingsLayout ? 10 : -1
        },
        {
            label: 'Go to SMTP settings',
            keys: isOnSettingsLayout ? ['g', 's'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.$id}/settings/smtp`);
            },
            disabled: !$project?.$id || (isOnSettingsLayout && $page.url.pathname.includes('smtp')),
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

    function initReo() {
        if (dev || !browser || !isCloud) return;

        const clientID = '144fa7eaa4904e8';
        const reoPromise = loadReoScript({ clientID });

        reoPromise.then(async (reo: Reo) => {
            reo.init({ clientID });

            if (Object.keys($user).length) {
                const name = $user.name || $user.email;
                const nameParts = name.trim().split(' ');
                const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

                const reoIdentity: ReoUserIdentifyConfig = {
                    username: $user.email,
                    firstname: nameParts[0],
                    type: $user.password ? 'email' : 'github',
                    ...(lastname && { lastname })
                };

                reo.identify(reoIdentity);
            }
        });
    }

    onMount(async () => {
        initReo();

        loading.set(false);
        if (!localStorage.getItem('feedbackElapsed')) {
            localStorage.setItem('feedbackElapsed', '0');
        }
        setInterval(() => {
            checkForFeedback(INTERVAL);
        }, INTERVAL);

        if (isCloud && hasStripePublicKey) {
            const loadStripe = (await import('@stripe/stripe-js')).loadStripe;

            $stripe = await loadStripe(VARS.PUBLIC_STRIPE_KEY);
            await checkForMissingPaymentMethod();
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

    database.subscribe(async (database) => {
        if (!database) return;
        // the component checks `isCloud` internally.
        await checkForDatabaseBackupPolicies(database);
    });

    let currentOrganizationId = null;
    async function checkForUsageLimits(org: Organization) {
        if (!org) return;
        if (currentOrganizationId === org.$id) return;
        if (isCloud) {
            currentOrganizationId = org.$id;
            await checkForUsageLimit(org);
            checkForMarkedForDeletion(org);
            await checkForNewDevUpgradePro(org);

            if (org?.billingPlan !== BillingPlan.FREE) {
                await paymentExpired(org);
                await checkPaymentAuthorizationRequired(org);
                await checkForMandate(org);

                if ($plansInfo.get(org.billingPlan)?.trialDays) {
                    calculateTrialDay(org);
                }
            }
            $activeHeaderAlert = headerAlert.get();
        }
    }

    $: checkForUsageLimits($organization);

    $: if (!$log.show) {
        $log.data = null;
        $log.func = null;
    }

    $: if ($requestedMigration) {
        openMigrationWizard();
    }

    $registerSearchers(orgSearcher, projectsSearcher);

    afterUpdate(() => {
        $activeHeaderAlert = headerAlert.get();
    });
</script>

<CommandCenter />

<Shell
    showSideNavigation={$page.url.pathname !== '/console' &&
        !$page?.params.organization &&
        !$page.url.pathname.includes('/console/account') &&
        !$page.url.pathname.includes('/console/card') &&
        !$page.url.pathname.includes('/console/onboarding')}>
    <Header slot="header" />
    <SideNavigation slot="side" />
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

{#if isCloud && $showUsageRatesModal}
    <UsageRates bind:show={$showUsageRatesModal} org={$organization} />
{/if}

<BottomModalAlert />
