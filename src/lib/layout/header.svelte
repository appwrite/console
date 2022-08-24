<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '.';
    import { Avatar, DropList, DropListItem, DropListLink } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import AppwriteLogo from '$lib/images/appwrite-gray-light.svg';
    import LightMode from '$lib/images/mode/light-mode.svg';
    import DarkMode from '$lib/images/mode/dark-mode.svg';
    import SystemMode from '$lib/images/mode/system-mode.svg';
    import { organizationList, organization, newOrgModal } from '../../routes/console/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let showDropdown = false;

    onMount(async () => {
        await organizationList.load();
        if (!$organization) {
            await organization.load($organizationList.teams[0].$id);
        }
    });
</script>

<a class="logo" href={`${base}/console`}>
    <img src={AppwriteLogo} width="132" height="34" alt="Appwrite" />
</a>

<Breadcrumbs />

<div class="main-header-end">
    <nav class="u-flex is-only-desktop">
        <button class="button is-small is-text"><span class="text">Feedback</span></button>
        <a
            href="https://appwrite.io/support"
            target="_blank"
            rel="noopener noreferrer"
            class="button is-small is-text u-margin-inline-end-16"
            ><span class="text">Support</span></a>
        <button class="button is-small is-secondary"><span class="text">Upgrade</span></button>
    </nav>
    <nav class="user-profile">
        {#if $user}
            <DropList bind:show={showDropdown} position="bottom" horizontal="left" arrow={false}>
                <button class="user-profile-button" on:click={() => (showDropdown = !showDropdown)}>
                    <Avatar
                        size={40}
                        name={$user.name}
                        src={sdkForConsole.avatars.getInitials($user.name, 40, 40).toString()} />
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
                <svelte:fragment slot="list">
                    {#each $organizationList.teams as org}
                        <DropListItem
                            on:click={() => {
                                showDropdown = false;
                                goto(`/console`);
                                organization.set(org);
                            }}>{org.name}</DropListItem>
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
                                }}>New organization</DropListItem>
                            <DropListLink href="/console/$me">Your Account</DropListLink>
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
                                        bind:group={$app.theme}
                                        value="auto" />
                                </label>
                            </li>
                        </ul>
                    </section>
                </svelte:fragment>
            </DropList>
        {/if}
    </nav>
</div>
