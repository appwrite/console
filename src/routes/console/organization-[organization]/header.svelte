<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { AvatarGroup, DropList, DropListItem, DropListLink, Tab, Tabs } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Cover } from '$lib/layout';
    import {
        memberList,
        newMemberModal,
        newOrgModal,
        organization,
        organizationList
    } from '$lib/stores/organization';
    import { sdkForConsole } from '$lib/stores/sdk';

    let avatars = [];
    let avatarsTotal = 0;
    let showDropdown = false;

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

    $: organizationId = $page.params.organization;
    $: path = `/console/organization-${organizationId}`;
    $: tabs = [
        {
            href: path,
            title: 'Projects'
        },
        {
            href: `${path}/members`,
            title: 'Members'
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ];
</script>

<Cover>
    <svelte:fragment slot="header">
        <DropList bind:show={showDropdown} position="bottom" arrow={false} scrollable={true}>
            <button
                class="button is-text u-padding-inline-0"
                on:click={() => (showDropdown = !showDropdown)}>
                <h1 class="heading-level-4">
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
    </svelte:fragment>
    <Tabs>
        {#each tabs as tab}
            <Tab href={tab.href} selected={$page.url.pathname === tab.href}>
                {tab.title}
            </Tab>
        {/each}
    </Tabs>
</Cover>
