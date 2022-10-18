<script lang="ts">
    import { navigating, page } from '$app/stores';
    import { tabs, title, backButton, copyData, titleDropdown } from '$lib/stores/layout';
    import { Cover } from '.';
    import {
        Copy,
        DropList,
        DropListItem,
        DropListLink,
        AvatarGroup,
        Tabs,
        Tab,
        Heading
    } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        organization,
        memberList,
        newOrgModal,
        newMemberModal
    } from '$lib/stores/organization';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { base } from '$app/paths';
    import { user } from '$lib/stores/user';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { wizard } from '$lib/stores/wizard';

    export let isOpen = false;
    export let showSideNavigation = false;

    let y: number;
    let showDropdown = false;

    navigating.subscribe(() => {
        if (isOpen) isOpen = false;
    });

    let avatars = [];
    let avatarsTotal = 0;

    memberList.subscribe((value) => {
        if (value?.total > 0) {
            avatarsTotal = value.total;
            avatars = value.memberships.map((team) => {
                return {
                    name: team.userName,
                    img: sdkForConsole.avatars.getInitials(team.userName, 80, 80).toString()
                };
            });
        }
    });

    const logout = async () => {
        await user.logout();
        await goto(`${base}/login`);
    };

    const toggleMenu = () => {
        y = 0;
        isOpen = !isOpen;
        if (browser) {
            if (isOpen) {
                document.body.classList.add('u-overflow-hidden');
            } else {
                document.body.classList.remove('u-overflow-hidden');
            }
        }
    };
</script>

<svelte:window bind:scrollY={y} />

<main
    class:grid-with-side={showSideNavigation}
    class:grid={!showSideNavigation}
    class:is-open={isOpen}
    class:u-hide={$wizard.show}>
    <header class="main-header">
        <button
            class:u-hide={!showSideNavigation}
            class="icon-button is-no-desktop"
            aria-label="Open Menu"
            on:click={toggleMenu}>
            <span class:icon-x={isOpen} class:icon-menu={!isOpen} aria-hidden="true" />
        </button>
        <slot name="header" />
    </header>
    <nav class="main-side">
        <slot name="side" />
    </nav>
    <section class="main-content">
        <Cover>
            <svelte:fragment slot="header">
                {#if $backButton}
                    <a class="back-button" href={$backButton} aria-label="page back">
                        <span class="icon-cheveron-left" aria-hidden="true" />
                    </a>
                {/if}
                {#if $titleDropdown?.length && $organization}
                    <DropList
                        bind:show={showDropdown}
                        position="bottom"
                        arrow={false}
                        scrollable={true}>
                        <button
                            class="button is-text u-padding-inline-0"
                            on:click={() => (showDropdown = !showDropdown)}>
                            <Heading tag="h1" size="4">
                                <span class="text"> {$organization.name}</span>

                                <span
                                    class={`icon-cheveron-${showDropdown ? 'up' : 'down'}`}
                                    aria-hidden="true" />
                            </Heading>
                        </button>
                        <svelte:fragment slot="list">
                            {#each $titleDropdown as org}
                                <DropListLink
                                    href={`${base}/console/organization-${org.$id}`}
                                    on:click={() => {
                                        showDropdown = false;
                                    }}>
                                    {org.name}
                                </DropListLink>
                            {/each}
                        </svelte:fragment>
                        <svelte:fragment slot="other">
                            <section class="drop-section">
                                <ul class="drop-list">
                                    <DropListItem
                                        icon="plus"
                                        on:click={() => {
                                            showDropdown = false;
                                            newOrgModal.set(true);
                                        }}>New Organization</DropListItem>
                                </ul>
                            </section></svelte:fragment>
                    </DropList>
                    <div class="u-margin-inline-start-auto">
                        <div class="u-flex u-gap-16">
                            <AvatarGroup size={40} {avatars} total={avatarsTotal} />
                            <Button secondary on:click={() => newMemberModal.set(true)}>
                                <span class="icon-plus" aria-hidden="true" />
                                <span class="text">Invite</span>
                            </Button>
                        </div>
                    </div>
                {:else}
                    <Heading tag="h1" size="4">
                        <span class="text">{$title ? $title : '-'}</span>
                    </Heading>
                {/if}
                {#if $page.url.pathname.includes('/console/account')}
                    <div class="u-margin-inline-start-auto">
                        <Button secondary on:click={logout}>Logout</Button>
                    </div>
                {/if}

                {#if $copyData?.value}
                    <Copy value={$copyData.value}>
                        <Pill button>
                            <span class="icon-duplicate" aria-hidden="true" />
                            {$copyData.text}
                        </Pill>
                    </Copy>
                {/if}
            </svelte:fragment>

            {#if $tabs.length}
                <Tabs>
                    {#each $tabs as tab}
                        <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                            {tab.title}
                        </Tab>
                    {/each}
                </Tabs>
            {/if}
        </Cover>
        <slot />
    </section>
</main>

<style>
    .grid-with-side {
        min-height: 100vh;
    }

    .main-side {
        z-index: 25;
    }
    @media (max-width: 550.99px), (min-width: 551px) and (max-width: 1198.99px) {
        .main-side {
            top: 4.5rem;
        }
    }
</style>
