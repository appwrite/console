<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { AvatarGroup, DropList, DropListItem, DropListLink, Tab, Tabs } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { isTabSelected } from '$lib/helpers/load';
    import { Cover } from '$lib/layout';
    import {
        members,
        newMemberModal,
        newOrgModal,
        organization,
        organizationList
    } from '$lib/stores/organization';
    import LL from '$i18n/i18n-svelte';

    let showDropdown = false;

    $: avatars = $members.memberships?.map((m) => m.userName) ?? [];
    $: organizationId = $page.params.organization;
    $: path = `/console/organization-${organizationId}`;
    $: tabs = [
        {
            href: path,
            title: $LL.console.organization.navbar.header.projects(),
            event: 'projects',
            hasChildren: true
        },
        {
            href: `${path}/members`,
            title: $LL.console.organization.navbar.header.members(),
            event: 'members',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            title: $LL.console.organization.navbar.header.settings(),
            event: 'settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <DropList bind:show={showDropdown} placement="bottom-start" noArrow scrollable>
            <button
                class="button is-text u-padding-inline-0"
                on:click={() => (showDropdown = !showDropdown)}>
                <h1 class="heading-level-4 u-flex u-cross-center u-gap-8">
                    <span class="text"> {$organization.name}</span>
                    <span
                        class={`icon-cheveron-${showDropdown ? 'up' : 'down'}`}
                        aria-hidden="true" />
                </h1>
            </button>
            <svelte:fragment slot="list">
                {#each $organizationList.teams as org}
                    <DropListLink
                        href={`${base}/console/organization-${org.$id}`}
                        on:click={() => (showDropdown = false)}>
                        {org.name}
                    </DropListLink>
                {/each}
            </svelte:fragment>
            <svelte:fragment slot="other">
                <section class="drop-section">
                    <ul class="drop-list">
                        <DropListItem icon="plus" on:click={() => newOrgModal.set(true)}>
                            {$LL.console.organization.texts.dropDown()}
                        </DropListItem>
                    </ul>
                </section></svelte:fragment>
        </DropList>
        <div class="u-margin-inline-start-auto">
            <div class="u-flex u-gap-16">
                <a href={`${path}/members`}>
                    <AvatarGroup size={40} {avatars} total={$members?.total ?? 0} />
                </a>
                <Button secondary on:click={() => newMemberModal.set(true)}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">{$LL.console.organization.button.invite()}</span>
                </Button>
            </div>
        </div>
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab
                href={tab.href}
                selected={isTabSelected(tab, $page.url.pathname, path, tabs)}
                event={tab.event}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
