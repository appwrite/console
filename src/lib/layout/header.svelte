<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { AvatarInitials, DropList, DropListItem, DropListLink, Support } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';
    import { organizationList, organization, newOrgModal } from '$lib/stores/organization';
    import { page } from '$app/stores';
    import { Submit, trackEvent } from '$lib/actions/analytics';
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
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import { wizard } from '$lib/stores/wizard';
    import CreateOrganizationCloud from '$routes/console/createOrganizationCloud.svelte';
    import { Feedback } from '$lib/components/feedback';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';

    let showDropdown = false;
    let showSupport = false;
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

    function createOrg() {
        showDropdown = false;
        if (isCloud) {
            wizard.start(CreateOrganizationCloud);
        } else newOrgModal.set(true);
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

<div class="logo u-inline-flex u-gap-16 u-cross-center">
    <a
        href={$organization
            ? `${base}/console/organization-${$organization.$id}`
            : `${base}/console`}>
        <img
            src={$app.themeInUse == 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
            width="120"
            height="22"
            alt="Appwrite" />
    </a>
    {#if isCloud}
        <div
            class="tag eyebrow-heading-3"
            style="--p-tag-height: 1.785rem; --p-tag-content-height: 1.15rem; padding-block: 0.25rem;">
            <span class="text u-x-small" style="font-weight: 500">Beta</span>
        </div>
    {/if}
</div>

{#if $page.data.breadcrumbs}
    <svelte:component this={$page.data.breadcrumbs} />
{/if}

<div class="main-header-end">
    <nav class="u-flex is-only-desktop u-cross-center">
        {#if isCloud && $organization?.billingPlan !== 'tier-2' && !$page.url.pathname.startsWith('/console/account')}
            <Button secondary on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
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
                <span class="text">Feedback</span>
            </button>
            <svelte:fragment slot="other">
                <Feedback />
            </svelte:fragment>
        </DropList>

        {#if isCloud}
            <DropList width="17.5" bind:show={showSupport} scrollable={true}>
                <Button text on:click={() => (showSupport = !showSupport)}>
                    <span class="text">Support</span>
                </Button>
                <svelte:fragment slot="other">
                    <Support bind:show={showSupport} />
                </svelte:fragment>
            </DropList>
        {/if}
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
            on:click={toggleCommandCenter}>
            <i class="icon-search" />
        </Button>
    </nav>
    <nav class="u-flex u-height-100-percent u-sep-inline-start">
        {#if $user}
            <div class="drop-wrapper" class:is-open={showDropdown} bind:this={droplistElement}>
                <button class="user-profile-button" on:click={() => (showDropdown = !showDropdown)}>
                    <AvatarInitials size={40} name={$user.name} />
                    <span class="user-profile-info is-only-desktop">
                        <span class="name" data-private>{$user.name}</span>
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
                                <DropListItem icon="plus" on:click={createOrg}>
                                    New organization
                                </DropListItem>
                                <DropListLink
                                    href={`${base}/console/account`}
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
