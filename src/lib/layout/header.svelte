<script lang="ts">
    import { base } from '$app/paths';
    import { Avatar, DropList, DropListItem, DropListLink } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { project } from '../../routes/console/[project]/store';

    let showDropdown = false;
</script>

<a class="logo" href={`${base}/console`}>
    <img src="/images/appwrite-gray-light.svg" width="132" height="34" alt="Appwrite" />
</a>
<nav class="breadcrumbs is-only-desktop" aria-label="breadcrumb">
    <ol class="breadcrumbs-list">
        <li class="breadcrumbs-item">
            <a href="#/">Home</a>
        </li>
    </ol>
</nav>

<div class="main-header-end">
    <nav class="u-flex is-only-desktop">
        <button class="button is-small is-text"><span class="text">Feedback</span></button>
        <button class="button is-small is-text"><span class="text">Support</span></button>
        <button class="button is-small is-secondary"><span class="text">Upgrade</span></button>
    </nav>
    <nav class="user-profile">
        {#if $user && $project}
            <DropList bind:show={showDropdown} position="bottom" horizontal="left" arrow={false}>
                <button class="user-profile-button" on:click={() => (showDropdown = !showDropdown)}>
                    <Avatar
                        size={50}
                        name={$user.name}
                        src={sdkForConsole.avatars.getInitials($user.name, 50, 50).toString()} />
                    <span class="user-profile-info is-only-desktop">
                        <span class="name">{$user.name}</span>
                        <span class="title">{$project.name}</span>
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
                                    <img src="/images/mode/light-mode.svg" alt="light mode" />
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
                                    <img src="/images/mode/dark-mode.svg" alt="dark mode" />
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
                                    <img src="/images/mode/system-mode.svg" alt="system mode" />
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
