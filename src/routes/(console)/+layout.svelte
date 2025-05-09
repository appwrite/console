<script lang="ts">
    import { page } from '$app/state';
    import { BillingPlan, INTERVAL } from '$lib/constants';
    import Footer from '$lib/layout/footer.svelte';
    import Shell from '$lib/layout/shell.svelte';
    import { app } from '$lib/stores/app';
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
    import { project } from './project-[region]-[project]/store';
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
    import {
        IconAnnotation,
        IconBookOpen,
        IconDiscord,
        IconPencil,
        IconPlus,
        IconQuestionMarkCircle,
        IconSparkles,
        IconSwitchHorizontal
    } from '@appwrite.io/pink-icons-svelte';

    function kebabToSentenceCase(str: string) {
        return str
            .split('-')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ');
    }

    const isAssistantEnabled = $consoleVariables?._APP_ASSISTANT_ENABLED === true;

    export let data;
    $: loadedProjects = data.projects.map((project) => {
        return {
            name: project?.name,
            $id: project.$id,
            isSelected: data.currentProjectId === project.$id,
            platformCount: project.platforms.length,
            pingCount: project.pingCount
        };
    });

    $: isOnSettingsLayout = $project?.$id
        ? page.url.pathname.includes(`project-${$project.region}-${$project.$id}/settings`)
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
                (page.url.pathname.includes('/console/organization-') &&
                    !page.url.pathname.endsWith('/members') &&
                    !page.url.pathname.endsWith('/settings')) ||
                !$canSeeProjects,
            rank: -1
        },
        {
            label: 'Ask the AI',
            callback: () => {
                addSubPanel(AIPanel);
            },
            keys: ['a', 'i'],
            icon: IconSparkles,
            disabled: !isAssistantEnabled
        },
        {
            label: 'Create new organization',
            callback: () => {
                isCloud ? goto(`${base}/create-organization`) : newOrgModal.set(true);
            },
            keys: ['c', 'o'],
            group: 'organizations',
            icon: IconPlus
        },
        {
            label: 'Open documentation',
            callback: () => {
                window.open('https://appwrite.io/docs', '_blank');
            },
            group: 'help',
            icon: IconBookOpen
        },
        {
            label: 'Contact support',
            callback: () => {
                window.open('https://appwrite.io/discord', '_blank');
            },
            group: 'help',
            icon: IconQuestionMarkCircle
        },
        {
            label: 'Send feedback',
            callback: () => {
                feedback.toggleFeedback();
            },
            group: 'help',
            icon: IconAnnotation
        },
        {
            label: 'Join Discord community',
            callback: () => {
                window.open('https://appwrite.io/discord', '_blank');
            },
            group: 'help',
            icon: IconDiscord
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
                icon: IconSwitchHorizontal,
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
                        await goto(
                            `${base}/project-${$project.region}-${$project.$id}/auth/security#${heading}`
                        );
                        scrollBy({ top: -100 });
                    },
                    disabled: !$project?.$id,
                    group: 'security',
                    icon: IconPencil
                }) as const
        ),
        // Settings
        {
            label: 'Go to settings overview',

            keys: isOnSettingsLayout ? ['g', 'o'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/settings`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && page.url.pathname.endsWith('settings')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',
            rank: isOnSettingsLayout ? 40 : -1
        },
        {
            label: 'Go to custom domains',

            keys: isOnSettingsLayout ? ['g', 'd'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/settings/domains`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && page.url.pathname.includes('domains')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',
            rank: isOnSettingsLayout ? 30 : -1
        },
        {
            label: 'Go to webhooks',
            keys: isOnSettingsLayout ? ['g', 'w'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/settings/webhooks`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && page.url.pathname.includes('webhooks')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',

            rank: isOnSettingsLayout ? 20 : -1
        },
        {
            label: 'Go to migrations',
            keys: isOnSettingsLayout ? ['g', 'm'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/settings/migrations`);
            },
            disabled:
                !$project?.$id || (isOnSettingsLayout && page.url.pathname.includes('migrations')),
            group: isOnSettingsLayout ? 'navigation' : 'settings',

            rank: isOnSettingsLayout ? 10 : -1
        },
        {
            label: 'Go to SMTP settings',
            keys: isOnSettingsLayout ? ['g', 's'] : undefined,
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/settings/smtp`);
            },
            disabled: !$project?.$id || (isOnSettingsLayout && page.url.pathname.includes('smtp')),
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
    onMount(async () => {
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
        if (!database || !page.params.region || !page.params.project) return;
        // the component checks `isCloud` internally.
        await checkForDatabaseBackupPolicies(page.params.region, page.params.project, database);
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
    showSideNavigation={page.url.pathname !== '/console' &&
        !page?.params.organization &&
        !page.url.pathname.includes('/console/account') &&
        !page.url.pathname.includes('/console/card') &&
        !page.url.pathname.includes('/console/onboarding')}
    showHeader={!page.url.pathname.includes('/console/onboarding')}
    showFooter={!page.url.pathname.includes('/console/onboarding')}
    bind:loadedProjects
    bind:projects={data.projects}>
    <!--    <Header slot="header" />-->
    <slot />
    <Footer slot="footer" />
</Shell>

{#if $wizard.show && $wizard.component}
    <svelte:component this={$wizard.component} {...$wizard.props} />
{:else if $wizard.cover}
    <svelte:component this={$wizard.cover} />
{/if}

<Create bind:show={$newOrgModal} />

{#if $showSupportModal}
    <MobileSupportModal bind:show={$showSupportModal}></MobileSupportModal>
{/if}

{#if isCloud && $showUsageRatesModal}
    <UsageRates bind:show={$showUsageRatesModal} org={$organization} />
{/if}

<BottomModalAlert />
