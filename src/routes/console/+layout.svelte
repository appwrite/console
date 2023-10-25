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
    import { onMount } from 'svelte';
    import { loading, requestedMigration } from '../store';
    import Create from './createOrganization.svelte';
    import {
        failedInvoice,
        daysLeftInTrial,
        tierToPlan,
        trialEndDate,
        readOnly
    } from '$lib/stores/billing';
    import { diffDays, toLocaleDate } from '$lib/helpers/date';
    import { base } from '$app/paths';

    import { goto } from '$app/navigation';

    import { CommandCenter, registerCommands, registerSearchers } from '$lib/commandCenter';
    import { AIPanel, OrganizationsPanel, ProjectsPanel } from '$lib/commandCenter/panels';
    import { orgSearcher, projectsSearcher } from '$lib/commandCenter/searchers';
    import { addSubPanel } from '$lib/commandCenter/subPanels';
    import { addNotification, notifications } from '$lib/stores/notifications';
    import { openMigrationWizard } from './(migration-wizard)';
    import { project } from './project-[project]/store';
    import { feedback } from '$lib/stores/feedback';
    import { consoleVariables } from './store';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';

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

    organization.subscribe((org) => {
        if (!org) return;
        if (isCloud) {
            if (org?.billingPlan === 'tier-0') {
                $daysLeftInTrial = 0;
                $trialEndDate = null;
            } else {
                calculateTrialDay(new Date(org?.billingTrialStartDate), org?.billingTrialDays);
            }

            checkForTrialEnding();
            paymentExpired();
            checkForUsageLimit();
        }
    });

    function calculateTrialDay(startDate: Date, trialDays: number) {
        const today = new Date();
        const days = diffDays(startDate, today);
        $daysLeftInTrial = trialDays - days;
        $trialEndDate = new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000);
    }

    function checkForTrialEnding() {
        if (localStorage.getItem('trialEndingNotification') === 'true' || !$daysLeftInTrial) return;
        else if ($daysLeftInTrial <= 5) {
            addNotification({
                type: 'info',
                isHtml: true,
                message: `<b>We hope you've been enjoying the ${
                    tierToPlan($organization.billingPlan).name
                } plan.</b>
                You will be billed on a recurring 30 day cycle after your trial period ends on <b>${toLocaleDate(
                    $trialEndDate?.toString()
                )}</b>`
            });
            localStorage.setItem('trialEndingNotification', 'true');
        }
    }

    function checkForUsageLimit() {
        if (!$organization?.billingLimits) return;
        const { bandwidth, documents, executions, storage, users } = $organization.billingLimits;
        readOnly.set({
            bandwidth: bandwidth >= 100,
            documents: documents >= 100,
            executions: executions >= 100,
            storage: storage >= 100,
            users: users >= 100
        });
    }

    async function paymentExpired() {
        if (!$organization?.paymentMethodId) return;
        const payment = await sdk.forConsole.billing.getPaymentMethod(
            $organization.paymentMethodId
        );
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const expiredMessage = `The default payment method for <b>${$organization.name}</b> has expired`;
        const expiringMessage = `The default payment method for <b>${$organization.name}</b> will expire soon`;
        const expiredNotification = $notifications.some((n) => n.message === expiredMessage);
        const expiringNotification = $notifications.some((n) => n.message === expiringMessage);
        if (payment.expired && !expiredNotification) {
            addNotification({
                type: 'error',
                isHtml: true,
                timeout: 0,
                message: expiredMessage,
                buttons: [
                    {
                        name: 'Update payment details',
                        method: () => {
                            goto(`${base}/console/account/payments`);
                        }
                    }
                ]
            });
        } else if (
            !expiringNotification &&
            payment.expiryYear <= year &&
            payment.expiryMonth < month
        ) {
            addNotification({
                type: 'warning',
                isHtml: true,
                message: expiringMessage,
                buttons: [
                    {
                        name: 'Update payment details',
                        method: () => {
                            goto(`${base}/console/account/payments`);
                        }
                    }
                ]
            });
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
    <svelte:fragment slot="alert">
        {#if $failedInvoice}
            {@const daysPassed = diffDays(new Date($failedInvoice.dueAt), new Date())}
            <section class="alert is-action is-action-and-top-sticky is-danger u-sep-block-end">
                <div class="alert-grid">
                    <span class="icon-info" aria-hidden="true" />
                    <div class="alert-content">
                        <h6 class="alert-title">Your projects are at risk</h6>
                        <p class="alert-message">
                            {#if daysPassed > 30}
                                Your scheduled payment on <b
                                    >{toLocaleDate($failedInvoice.dueAt)}</b> failed. To resume write
                                access of your organization, please update your billing details.
                            {:else}
                                Your scheduled payment on <b
                                    >{toLocaleDate($failedInvoice.dueAt)}</b> failed. Access to paid
                                projects within this organization will be disabled if no action is taken
                                within 30 days.
                            {/if}
                        </p>
                    </div>
                    <div class="alert-buttons u-flex u-gap-16 u-cross-child-center">
                        <a
                            href={`${base}/console/organization-${$failedInvoice.teamId}/billing#paymentMethods`}
                            class="button is-secondary is-full-width-mobile">
                            <span class="text">Update billing details</span>
                        </a>
                    </div>
                </div>
            </section>
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
