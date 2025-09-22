<script lang="ts">
    import Sidebar from '$lib/components/sidebar.svelte';
    import Navbar from '$lib/components/navbar.svelte';
    import SendVerificationEmailModal from '$lib/components/account/sendVerificationEmailModal.svelte';
    import { writable } from 'svelte/store';
    import { invalidate } from '$app/navigation';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { BillingPlan } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { tierToPlan } from '$lib/stores/billing';
    import { Dependencies } from '$lib/constants';
    import type { PageData } from './$types';

    export let data: PageData;

    let sideBarIsOpen = writable(false);
    let showAccountMenu = writable(false);
    let project: any = {
        $id: 'verify-email-project',
        region: 'us-east-1',
        name: 'Verify Email Project'
    };
    let avatar = '/images/default-avatar.png';
    let progressCard = {
        title: 'Get started',
        percentage: 33
    };

    let navbarProps = {
        logo: {
            src: '/images/appwrite-logo-light.svg',
            alt: 'Appwrite Logo'
        },
        avatar: avatar,
        organizations: [],
        currentProject: project
    };

    // Show verification modal only if email is not verified
    let showVerificationModal = !data.user?.emailVerification;

    // Check if user should be on this page (reactive)
    $: if (data.user?.emailVerification) {
        // Email is verified, redirect immediately
        checkEmailVerification();
    }

    async function createOrganizationForNewUser() {
        try {
            let organization = null;

            if (isCloud) {
                organization = await sdk.forConsole.billing.createOrganization(
                    ID.unique(),
                    'Personal projects',
                    BillingPlan.FREE,
                    null,
                    null
                );

                trackEvent(Submit.OrganizationCreate, {
                    plan: tierToPlan(BillingPlan.FREE)?.name,
                    budget_cap_enabled: false,
                    members_invited: 0
                });
            } else {
                organization = await sdk.forConsole.teams.create({
                    teamId: ID.unique(),
                    name: 'Personal projects'
                });
            }

            await invalidate(Dependencies.ORGANIZATIONS);

            return organization;
        } catch (e) {
            trackError(e, Submit.OrganizationCreate);
            throw e;
        }
    }

    // Check if email gets verified and redirect accordingly
    async function checkEmailVerification() {
        if (data.user?.emailVerification) {
            if (!data.organization) {
                try {
                    await createOrganizationForNewUser();
                    await goto(`${base}/onboarding/create-project`);
                } catch (e) {
                    await goto(`${base}/create-organization`);
                }
            } else if (!(data.organization as any)?.onboardingCompleted) {
                await goto(`${base}/onboarding/create-project`);
            } else {
                await goto(`${base}`);
            }
        }
    }

    onMount(() => {
        // If no user data, redirect to login
        if (!data.user) {
            goto(`${base}/login`);
            return;
        }

        // If email is already verified, redirect immediately
        if (data.user?.emailVerification) {
            checkEmailVerification();
            return;
        }

        const interval = setInterval(async () => {
            await invalidate(Dependencies.ACCOUNT);
            checkEmailVerification();
        }, 2000);

        return () => clearInterval(interval);
    });
</script>

<svelte:head>
    <title>Verify Email - Appwrite Console</title>
</svelte:head>

<div class="verify-email-page">
    <Navbar
        {...navbarProps}
        bind:sideBarIsOpen={$sideBarIsOpen}
        bind:showAccountMenu={$showAccountMenu} />

    <Sidebar
        bind:sideBarIsOpen={$sideBarIsOpen}
        bind:showAccountMenu={$showAccountMenu}
        {project}
        {avatar}
        {progressCard}
        state="open" />

    <div class="main-content">
        <!-- Main content area -->
    </div>

    <!-- email verification modal -->
    <SendVerificationEmailModal bind:show={showVerificationModal} email={data.user?.email} />
</div>

<style lang="scss">
    .verify-email-page {
        display: flex;
        min-height: 100vh;
        position: relative;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .main-content {
        flex: 1;
        padding: 2rem;
        margin-left: 190px;
        min-height: 100vh;
    }
    :global(.verify-email-page .sidebar) {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        height: 100vh !important;
        z-index: 1000 !important;
        filter: blur(4px);
        opacity: 0.6;
    }

    /* Blur the navbar */
    :global(.verify-email-page .navbar),
    :global(.verify-email-page [data-pink-navbar]),
    :global(.verify-email-page header) {
        filter: blur(2px);
        opacity: 0.4;
        z-index: 1;
    }

    .main-content {
        filter: blur(4px);
        opacity: 0.6;
    }

    /* efnsure modal is above everything and not blurred */
    :global(.verify-email-page .email-verification-scrim) {
        z-index: 9999 !important;
        filter: none !important;
        opacity: 1 !important;
    }

    :global(.verify-email-page .email-verification-scrim *) {
        filter: none !important;
        opacity: 1 !important;
    }
</style>
