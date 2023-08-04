<script lang="ts">
    import { base } from '$app/paths';
    import {
        AvatarInitials,
        DropList,
        DropListItem,
        DropListLink,
        FeedbackGeneral,
        FeedbackNPS
    } from '$lib/components';
    import AppwriteLogo from '$lib/images/appwrite-gray-light.svg';
    import DarkMode from '$lib/images/mode/dark-mode.svg';
    import LightMode from '$lib/images/mode/light-mode.svg';
    import SystemMode from '$lib/images/mode/system-mode.svg';
    import { app, feedback } from '$lib/stores/app';
    import { newOrgModal, organization, organizationList } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';

    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { sdk } from '$lib/stores/sdk';
    import { slide } from 'svelte/transition';
    import { isCloud } from '$lib/system';

    let showFeedback = false;
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

    const slideFade: typeof slide = (node, options) => {
        const slideTrans = slide(node, options);
        return {
            ...slideTrans,
            css: (t, u) => `
            ${slideTrans.css(t, u)};
            opacity: ${t};
			`
        };
    };
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
                {#if $feedback.type === 'nps'}
                    <FeedbackNPS />
                {:else}
                    <FeedbackGeneral />
                {/if}
            </svelte:fragment>
        </DropList>
        <a
            href="https://appwrite.io/support"
            target="_blank"
            rel="noopener noreferrer"
            class="button is-small is-text">
            <span class="text">Support</span>
        </a>
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
                        transition:slideFade={{ duration: 150 }}>
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
                        {#if isCloud}
                            <section class="drop-section">
                                <a
                                    class="claim"
                                    title="Gradient Border"
                                    href="/card"
                                    data-sveltekit-reload>
                                    Claim your Cloud card
                                </a>
                            </section>
                        {/if}
                    </div>
                {/if}
            </div>
        {/if}
    </nav>
</div>

<style lang="scss">
    .claim {
        display: block;
        background-image: linear-gradient(90deg, #fd7f34, #bd155b);

        padding: 0.6875rem 0.625rem;
        position: relative;
        z-index: 0;
        border-radius: 0.5rem;
        text-align: center;
        width: 100%;

        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 150%;

        letter-spacing: 0.12em;
        text-transform: uppercase;

        color: #ffffff;

        transition: 150ms ease;

        &::before {
            content: '';
            position: absolute;
            left: -1px;
            top: -1px;
            width: calc(100% + 2px);
            height: calc(100% + 2px);
            background: linear-gradient(
                113.48deg,
                #3b3b4eaa -15.8%,
                rgba(255, 255, 255, 0.7) 27.72%,
                #3b3b4eaa 109.47%
            );
            z-index: -2;
            border-radius: 0.3125rem;
        }

        &::after {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, #1b1b28 0%, #272739 62.73%, #c81b4c 136.87%);
            z-index: -1;

            border-radius: 0.25rem;
        }

        &:hover {
            opacity: 0.75;
        }
    }
</style>
