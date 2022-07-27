<script lang="ts">
    import { base } from '$app/paths';
    import { Avatar, DropList, DropListItem, DropListLink } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { project } from '../../routes/console/[project]/store';
    import AppwriteLogo from '$lib/images/appwrite-gray-light.svg';
    import LightMode from '$lib/images/mode/light-mode.svg';
    import DarkMode from '$lib/images/mode/dark-mode.svg';
    import SystemMode from '$lib/images/mode/system-mode.svg';
    import Breadcrumbs from './breadcrumbs.svelte';

    let showDropdown = false;
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
            class="button is-small is-text"><span class="text">Support</span></a>
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
                        {#if $project}
                            <span class="title">{$project.name}</span>
                        {/if}
                    </span>
                    <span
                        class="is-only-desktop"
                        aria-hidden="true"
                        class:icon-cheveron-up={showDropdown}
                        class:icon-cheveron-down={!showDropdown} />
                </button>
                <svelte:fragment slot="list">
                    <DropListItem icon="plus">New organisation</DropListItem>
                    <DropListLink href="/console/$me">Your Account</DropListLink>
                </svelte:fragment>
                <svelte:fragment slot="other">
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
