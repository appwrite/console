<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { toggleCommandCenter } from '$lib/commandCenter/commandCenter.svelte';
    import { AvatarInitials, DropList, DropListItem, DropListLink } from '$lib/components';
    import { Feedback } from '$lib/components/feedback';
    import AppwriteLogo from '$lib/images/appwrite-gray-light.svg';
    import DarkMode from '$lib/images/mode/dark-mode.svg';
    import LightMode from '$lib/images/mode/light-mode.svg';
    import SystemMode from '$lib/images/mode/system-mode.svg';
    import { app } from '$lib/stores/app';
    import { feedback } from '$lib/stores/feedback';
    import { newOrgModal, organization, organizationList } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { slide } from 'svelte/transition';

    let showDropdown = false;
    let droplistElement: HTMLDivElement;

    function toggleFeedback() {
        feedback.toggleFeedback();
        if ($feedback.notification) {
            feedback.toggleNotification();
            feedback.addVisualization();
        }
    }

    async function logout() {
        await sdk.forConsole.account.deleteSession('current');
        trackEvent(Submit.AccountLogout);
        await goto(`${base}/login`);
    }

    function onBlur(event: MouseEvent) {
        if (
            showDropdown &&
            !(event.target === droplistElement || droplistElement.contains(event.target as Node))
        ) {
            showDropdown = false;
        }
    }

    $: if (showDropdown) {
        trackEvent('click_menu_dropdown');
    }
</script>

<svelte:window on:click={onBlur} />

<a
    class="logo"
    href={$organization ? `${base}/console/organization-${$organization.$id}` : `${base}/console`}>
    <img src={AppwriteLogo} width="132" height="34" alt="Appwrite" />
</a>

{#if $page.data.breadcrumbs}
    <svelte:component this={$page.data.breadcrumbs} />
{/if}

<div class="main-header-end">
    <nav class="u-flex is-only-desktop">
        {#if $feedback.notification}
            <div class="u-flex u-cross-center">
                <div class="pulse-notification" />
            </div>
        {/if}
        <DropList show={$feedback.show} scrollable on:blur={toggleFeedback}>
            <button class="button is-small is-text" on:click={toggleFeedback}>
                <span class="text">Feedback</span>
            </button>
            <svelte:fragment slot="other">
                <Feedback />
            </svelte:fragment>
        </DropList>
        <a
            href="https://appwrite.io/support"
            target="_blank"
            rel="noopener noreferrer"
            class="button is-small is-text">
            <span class="text">Support</span>
        </a>
        <button class="button is-text is-small" on:click={toggleCommandCenter}>
            <i class="icon-search" />
        </button>
    </nav>
    <nav class="u-flex u-height-100-percent u-sep-inline-start">
        {#if $user}
            <div class="drop-wrapper" class:is-open={showDropdown} bind:this={droplistElement}>
                <button class="user-profile-button" on:click={() => (showDropdown = !showDropdown)}>
                    <AvatarInitials size={40} name={$user.name} />
                    <span class="user-profile-info is-only-desktop">
                        <span class="name">{$user.name}</span>
                        {#if $organization}
                            <span class="title">{$organization.name}</span>
                        {/if}
                    </span>
                    <span
                        class="is-only-desktop"
                        aria-hidden="true"
                        class:icon-cheveron-up={showDropdown}
                        class:icon-cheveron-down={!showDropdown} />
                </button>
                {#if showDropdown}
                    <div
                        class="drop is-no-arrow is-block-end is-inline-end"
                        transition:slide={{ duration: 100 }}>
                        {#if $organizationList?.total}
                            <section class="drop-section u-overflow-y-auto u-max-height-200">
                                <ul class="drop-list">
                                    {#each $organizationList.teams as org}
                                        <DropListLink
                                            href={`${base}/console/organization-${org.$id}`}
                                            on:click={() => {
                                                showDropdown = false;
                                            }}>{org.name}</DropListLink>
                                    {/each}
                                </ul>
                            </section>
                        {/if}
                        <section class="drop-section">
                            <ul class="drop-list">
                                <DropListItem
                                    icon="plus"
                                    on:click={() => {
                                        showDropdown = false;
                                        newOrgModal.set(true);
                                    }}>
                                    New organization
                                </DropListItem>
                                <DropListLink
                                    href={`${base}/console/account`}
                                    on:click={() => (showDropdown = false)}>
                                    Your Account
                                </DropListLink>
                                <DropListItem
                                    icon="logout-right"
                                    on:click={() => {
                                        showDropdown = false;
                                        logout();
                                    }}>
                                    Sign Out
                                </DropListItem>
                            </ul>
                        </section>
                        <section class="drop-section">
                            <ul class="u-flex u-gap-12">
                                <li>
                                    <label class="image-radio">
                                        <img src={LightMode} alt="light mode" />
                                        <input
                                            type="radio"
                                            class="is-small"
                                            name="mode"
                                            on:click={() =>
                                                trackEvent('select_theme', {
                                                    value: 'light'
                                                })}
                                            bind:group={$app.theme}
                                            value="light" />
                                    </label>
                                </li>
                                <li>
                                    <label class="image-radio">
                                        <img src={DarkMode} alt="dark mode" />
                                        <input
                                            type="radio"
                                            class="is-small"
                                            name="mode"
                                            on:click={() =>
                                                trackEvent('select_theme', {
                                                    value: 'dark'
                                                })}
                                            bind:group={$app.theme}
                                            value="dark" />
                                    </label>
                                </li>
                                <li>
                                    <label class="image-radio">
                                        <img src={SystemMode} alt="system mode" />
                                        <input
                                            type="radio"
                                            class="is-small"
                                            name="mode"
                                            on:click={() =>
                                                trackEvent('select_theme', {
                                                    value: 'system'
                                                })}
                                            bind:group={$app.theme}
                                            value="auto" />
                                    </label>
                                </li>
                            </ul>
                        </section>
                    </div>
                {/if}
            </div>
        {/if}
    </nav>
</div>
