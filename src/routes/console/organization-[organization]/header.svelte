<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { AvatarGroup, DropList, DropListItem, DropListLink, Tab, Tabs } from '$lib/components';
    import { Pill } from '$lib/elements';
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
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import CreateOrganizationCloud from '../createOrganizationCloud.svelte';

    let showDropdown = false;

    function createOrg() {
        showDropdown = false;
        if (isCloud) {
            wizard.start(CreateOrganizationCloud);
        } else newOrgModal.set(true);
    }

    $: avatars = $members.memberships?.map((m) => m.userName) ?? [];
    $: organizationId = $page.params.organization;
    $: path = `/console/organization-${organizationId}`;

    const permanentTabs = [
        {
            href: path,
            title: 'Projects',
            event: 'projects',
            hasChildren: true
        },
        {
            href: `${path}/members`,
            title: 'Members',
            event: 'members',
            hasChildren: true
        },
        {
            href: `${path}/settings`,
            event: 'settings',
            title: 'Settings'
        },
        {
            href: `${path}/usage`,
            event: 'usage',
            title: 'Usage',
            hasChildren: true
        }
    ];
    $: tabs = isCloud
        ? [
              ...permanentTabs,
              {
                  href: `${path}/billing`,
                  event: 'billing',
                  title: 'Billing'
              },
              {
                  href: `${path}/invoices`,
                  event: 'invoices',
                  title: 'Invoices'
              }
          ]
        : permanentTabs;
</script>

<Cover>
    <svelte:fragment slot="header">
        <DropList bind:show={showDropdown} placement="bottom-start" noArrow scrollable>
            <button
                class="button is-text u-padding-inline-0"
                on:click={() => (showDropdown = !showDropdown)}>
                <h1 class="heading-level-4 u-flex u-cross-center u-gap-8">
                    <span class="u-flex u-cross-center u-gap-8">
                        {$organization.name}
                        {#if isCloud && $organization?.billingPlan === 'tier-0'}
                            <Pill>FREE</Pill>
                        {/if}
                    </span>
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
                        <DropListItem icon="plus" on:click={createOrg}>
                            New Organization
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
                    <span class="text">Invite</span>
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
