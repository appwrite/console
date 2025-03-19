<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { AvatarInitials, DropList, DropListItem, DropListLink, Support } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';
    import { organizationList, organization, newOrgModal } from '$lib/stores/organization';
    import { page } from '$app/stores';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { toggleCommandCenter } from '$lib/commandCenter/commandCenter.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { isMac } from '$lib/helpers/platform';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import DarkMode from '$lib/images/mode/dark-mode.svg';
    import LightMode from '$lib/images/mode/light-mode.svg';
    import SystemMode from '$lib/images/mode/system-mode.svg';
    import { feedback } from '$lib/stores/feedback';
    import { slide } from 'svelte/transition';
    import { isCloud } from '$lib/system';
    import { Feedback } from '$lib/components/feedback';
    import { BillingPlan } from '$lib/constants';
    import { logout } from '$lib/helpers/logout';
    import { upgradeURL } from '$lib/stores/billing';

    let showDropdown = false;
    let showSupport = false;
    let droplistElement: HTMLDivElement;

    function toggleFeedback() {
        feedback.toggleFeedback();
        trackEvent(Click.FeedbackSubmitClick);
        if ($feedback.notification) {
            feedback.toggleNotification();
            feedback.addVisualization();
        }
    }

    function onBlur(event: MouseEvent) {
        if (
            showDropdown &&
            !(event.target === droplistElement || droplistElement.contains(event.target as Node))
        ) {
            showDropdown = false;
        }
    }

    function createOrg() {
        showDropdown = false;
        if (isCloud) {
            goto(`${base}/create-organization`);
        } else newOrgModal.set(true);
    }

    $: if (showDropdown) {
        trackEvent(Click.MenuDropDownClick);
    }

    const slideFade: typeof slide = (node, options) => {
        const slideTrans = slide(node, options);
        return {
            ...slideTrans,
            css: (t, u) => `
            ${slideTrans.css(t, u)};
            opacity: ${t};`
        };
    };
</script>

<svelte:window on:click={onBlur} />

<div class="logo u-inline-flex u-gap-16 u-cross-center">
    <a href={$organization ? `${base}/organization-${$organization.$id}` : base}>
        <img
            src={$app.themeInUse == 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
            width="120"
            height="22"
            alt="Appwrite" />
    </a>
    {#if isCloud}
        <div
            class="tag eyebrow-heading-3 u-padding-block-4"
            style="--p-tag-height: 1.785rem; --p-tag-content-height: 1.2rem;">
            <span class="text u-x-small" style="font-weight: 500">Beta</span>
        </div>
    {/if}
</div>

{#if $page.data.breadcrumbs}
    <svelte:component this={$page.data.breadcrumbs} />
{/if}

<div class="main-header-end">
    <nav class="u-flex is-only-desktop u-cross-center">
        {#if isCloud && $organization?.billingPlan === BillingPlan.FREE && !$page.url.pathname.startsWith('/console/account')}
            <Button
                disabled={$organization?.markedForDeletion}
                href={$upgradeURL}
                on:click={() => {
                    trackEvent(Click.OrganizationClickUpgrade, {
                        from: 'button',
                        source: 'top_nav'
                    });
                }}>
                Upgrade
            </Button>
        {/if}

        {#if $feedback.notification}
            <div class="u-flex u-cross-center">
                <div class="pulse-notification" />
            </div>
        {/if}
        <DropList show={$feedback.show} scrollable on:blur={toggleFeedback}>
            <button class="button is-small is-text" on:click={toggleFeedback}>
                {#if $feedback.notification}
                    <span
                        class="notification u-position-absolute u-inset-block-start-8 u-inset-inline-end-8"
                    ></span>
                {/if}
                <span class="text">Feedback</span>
            </button>
            <svelte:fragment slot="other">
                <Feedback />
            </svelte:fragment>
        </DropList>
        <DropList
            bind:show={showSupport}
            scrollable={true}
            noArrow
            width="28.25"
            placement="bottom-end"
            on:blur={() => (showSupport = !showSupport)}>
            <Button text on:click={() => (showSupport = !showSupport)}>
                <span class="text">Support</span>
            </Button>
            <svelte:fragment slot="other">
                <Support bind:show={showSupport} />
            </svelte:fragment>
        </DropList>
        <Button
            actions={[
                (node) => {
                    return tooltip(node, {
                        content: isMac() ? '⌘ + K' : 'Ctrl + K',
                        placement: 'bottom'
                    });
                }
            ]}
            text
            class="is-small"
            ariaLabel="Toggle Command Center"
            on:click={toggleCommandCenter}>
            <i class="icon-search" />
        </Button>
    </nav>
    <nav class="u-flex u-height-100-percent u-sep-inline-start">
        {#if $user}
            <div class="drop-wrapper" class:is-open={showDropdown} bind:this={droplistElement}>
                <button class="user-profile-button" on:click={() => (showDropdown = !showDropdown)}>
                    <AvatarInitials size="m" name={$user.name || $user.email} />
                    <span class="user-profile-info is-only-desktop">
                        <span class="name" data-private>{$user.name || $user.email}</span>
                        {#if $organization}
                            <span class="title" data-private>{$organization.name}</span>
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
                        transition:slideFade|global={{ duration: 150 }}>
                        {#if $organizationList?.total}
                            <section class="drop-section u-overflow-y-auto u-max-height-200">
                                <ul
                                    class="drop-list"
                                    data-sveltekit-preload-data={$page.params.organization
                                        ? false
                                        : 'hover'}>
                                    {#each $organizationList.teams as org}
                                        <DropListLink
                                            href={`${base}/organization-${org.$id}`}
                                            on:click={() => {
                                                showDropdown = false;
                                            }}>{org.name}</DropListLink>
                                    {/each}
                                </ul>
                            </section>
                        {/if}
                        <section class="drop-section">
                            <ul class="drop-list">
                                <DropListItem icon="plus" on:click={createOrg}>
                                    New organization
                                </DropListItem>
                                <DropListLink
                                    href={`${base}/account`}
                                    on:click={() => (showDropdown = false)}>
                                    Your account
                                </DropListLink>
                                <DropListItem
                                    icon="logout-right"
                                    on:click={() => {
                                        showDropdown = false;
                                        logout();
                                    }}>
                                    Sign out
                                </DropListItem>
                            </ul>
                        </section>
                        <section class="drop-section">
                            <ul class="u-flex u-gap-12">
                                <li class="u-stretch">
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
                                <li class="u-stretch">
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
                                <li class="u-stretch">
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

<style>
    :global(.support-drop-section) {
        width: 28.375rem;
        margin-block-start: 0.15rem;
    }
</style>
