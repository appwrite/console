<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Avatar, DropList, DropListItem, DropListLink } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';

    $: currentProject = $page.params.project;

    const toggleTheme = () => {
        $app.theme = $app.theme === 'light' ? 'dark' : 'light';
    };

    let showDropdown = false;
</script>

<button class="icon-button is-no-desktop" aria-label="Open Menu">
    <span class="icon-menu" aria-hidden="true" />
</button>
<a class="logo" href={`${base}/`}>
    <img src={`${base}/appwrite-nav.svg`} width="132" height="34" alt="Appwrite" />
</a>
<nav class="breadcrumbs is-only-desktop" aria-label="breadcrumb">
    <ol class="breadcrumbs-list">
        <li class="breadcrumbs-item">
            <a href={`${base}/console/${currentProject}`}>Home</a>
        </li>
        <!-- <li class="breadcrumbs-item"><a href="#" aria-level="2">News</a></li> -->
    </ol>
</nav>

<div class="main-header-end">
    <nav class="u-flex is-only-desktop" />
    <nav class="user-profile">
        {#if $user}
            <DropList bind:show={showDropdown} position="bottom" horizontal="left" arrow={false}>
                <button class="user-profile-button" on:click={() => (showDropdown = !showDropdown)}>
                    <Avatar
                        size={50}
                        name={$user.name}
                        src={sdkForConsole.avatars.getInitials($user.name, 50, 50).toString()} />
                    <span class="user-profile-info is-only-desktop">
                        <span class="name">{$user.name}</span>
                        <span class="title">{$user.name}</span>
                    </span>
                    <span
                        class="is-only-desktop"
                        aria-hidden="true"
                        class:icon-cheveron-down={!showDropdown} />
                </button>
                <svelte:fragment slot="list">
                    <DropListItem icon="plus">New organisation</DropListItem>
                    <DropListLink href="/console/$me">Your Account</DropListLink>
                    <DropListItem
                        on:click={toggleTheme}
                        icon={$app.theme === 'light' ? 'sun-inv' : 'moon-inv'}>
                        Toggle Theme
                    </DropListItem>
                </svelte:fragment>
            </DropList>
        {/if}
    </nav>
</div>
