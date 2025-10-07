<script lang="ts">
    import { page } from '$app/state';
    import { writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';
    import { Navbar, SendVerificationEmailModal, Sidebar } from '$lib/components';

    let sideBarIsOpen = writable(false);
    let showAccountMenu = writable(false);
    let showVerificationModal = $state(!page.data.account?.emailVerification);

    // fake props!
    const project = {
        region: 'fra',
        $id: 'appwrite',
        name: 'Appwrite Project'
    } as Models.Project;

    const progressCard = { title: 'Get started', percentage: 33 };
    const navbarProps = {
        logo: {
            src: 'https://appwrite.io/images/logos/logo.svg',
            alt: 'Logo Appwrite'
        },
        avatar: undefined,
        organizations: []
    };
</script>

<svelte:head>
    <title>Verify Email - Appwrite</title>
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
        avatar={navbarProps.avatar}
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

        :global {
            .sidebar {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                height: 100vh !important;
                z-index: 1000 !important;
                filter: blur(4px);
                opacity: 0.6;
            }

            .navbar,
            [data-pink-navbar],
            header {
                filter: blur(2px);
                opacity: 0.4;
                z-index: 1;
            }

            .email-verification-scrim {
                z-index: 9999 !important;
                filter: none !important;
                opacity: 1 !important;

                * {
                    filter: none !important;
                    opacity: 1 !important;
                }
            }
        }
    }
</style>
