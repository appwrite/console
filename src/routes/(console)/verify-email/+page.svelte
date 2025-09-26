<script lang="ts">
    import Sidebar from '$lib/components/sidebar.svelte';
    import Navbar from '$lib/components/navbar.svelte';
    import SendVerificationEmailModal from '$lib/components/account/sendVerificationEmailModal.svelte';
    import { writable } from 'svelte/store';
    import { invalidate } from '$app/navigation';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/state';

    let sideBarIsOpen = writable(false);
    let showAccountMenu = writable(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    let showVerificationModal = $state(!page.data.account?.emailVerification);

    $effect(() => {
        if (page.data.account?.emailVerification) {
            checkEmailVerification();
        }
    });

    async function checkEmailVerification() {
        if (page.data.account?.emailVerification) {
            await goto(`${base}/`);
        }
    }

    onMount(() => {
        if (!page.data.account) {
            goto(`${base}/login`);
            return;
        }

        // If email is already verified, redirect immediately
        if (page.data.account?.emailVerification) {
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

    <!-- email verification modal -->
    <SendVerificationEmailModal
        bind:show={showVerificationModal}
        email={page.data.account?.email} />
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

    /* ensure modal is above everything and not blurred */
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
