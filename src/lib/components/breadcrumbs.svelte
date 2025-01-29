<script lang="ts">
    import { createMenubar, melt } from '@melt-ui/svelte';
    import { Badge, Icon, type SheetMenu, ActionMenu } from '@appwrite.io/pink-svelte';
    import {
        IconChevronDown,
        IconChevronRight,
        IconPlus,
        IconPlusSm
    } from '@appwrite.io/pink-icons-svelte';
    import { BottomSheet } from '$lib/components';
    import { isSmallViewport } from '$lib/stores/viewport';

    type Project = {
        name: string;
        $id: string;
        isSelected: boolean;
    };
    type Organization = {
        name: string;
        $id: string;
        tierName: string;
        isSelected: boolean;
        projects: Array<Project>;
    };

    const {
        elements: { menubar },
        builders: { createMenu }
    } = createMenubar();

    const {
        elements: {
            trigger: triggerOrganizations,
            menu: menuOrganizations,
            item: itemOrganizations,
            separator: separatorOrganizations
        },
        builders: { createSubmenu: createSubmenuOrganizations, createMenuRadioGroup }
    } = createMenu();

    const {
        elements: { radioGroup: radioGroupOrganizations }
    } = createMenuRadioGroup({});

    const {
        elements: { subMenu: subMenuOrganizations, subTrigger: subTriggerOrganizations }
    } = createSubmenuOrganizations();

    const {
        elements: {
            trigger: triggerProjects,
            menu: menuProjects,
            item: itemProjects,
            separator: separatorProjects
        }
    } = createMenu();

    export let organizations: Organization[] = [];

    $: selectedOrg = organizations.find((organization) => organization.isSelected);
    $: selectedProject = selectedOrg?.projects.find((project) => project.isSelected);

    let organisationBottomSheetOpen = false;
    let projectsBottomSheetOpen = false;

    const switchOrganization = {
        top: {
            title: 'Switch Organization',
            items: organizations.map((organization) => ({
                name: organization.name,
                href: `/console/organization-${organization?.$id}`
            }))
        },
        bottom: {
            items: [
                {
                    name: 'Create organization',
                    leadingIcon: IconPlus,
                    href: `/console/create-organization`
                }
            ]
        }
    };

    $: organizationsBottomSheet = !selectedOrg
        ? switchOrganization
        : {
              top: {
                  items: [
                      {
                          name: 'Organization overview',
                          href: `/console/organization-${selectedOrg?.$id}`
                      }
                  ]
              },
              bottom:
                  organizations.length > 1
                      ? {
                            items: [
                                {
                                    name: 'Switch organization',
                                    trailingIcon: IconChevronRight,
                                    subMenu: switchOrganization
                                }
                            ]
                        }
                      : {
                            items: [
                                {
                                    name: 'Create organization',
                                    leadingIcon: IconPlus,
                                    href: `/console/create-organization`
                                }
                            ]
                        }
          };
    let projectsBottomSheet: SheetMenu;
    $: projectsBottomSheet = {
        top:
            selectedOrg?.projects.length > 1
                ? {
                      title: 'Switch project',
                      items: !selectedOrg
                          ? []
                          : selectedOrg?.projects
                                .map((project, index) => {
                                    if (index < 4) {
                                        return {
                                            name: project.name,
                                            href: `/console/project-${project.$id}/overview`
                                        };
                                    } else if (index === 4) {
                                        return {
                                            name: 'All projects',
                                            href: `/console/organization-${selectedOrg?.$id}`
                                        };
                                    }
                                    return null;
                                })
                                .filter((project) => project !== null)
                  }
                : {
                      items: [
                          {
                              name: 'Create project',
                              trailingIcon: IconPlus,
                              href: `/console/organization-${selectedOrg?.$id}?create-project`
                          }
                      ]
                  },
        bottom:
            selectedOrg?.projects.length > 1
                ? {
                      items: [
                          {
                              name: 'Create project',
                              trailingIcon: IconPlus,
                              href: `/console/organization-${selectedOrg?.$id}?create-project`
                          }
                      ]
                  }
                : undefined
    };
</script>

<div use:melt={$menubar}>
    {#if !$isSmallViewport}
        <span class="breadcrumb-separator">/</span>
        <button
            type="button"
            class="trigger"
            use:melt={$triggerOrganizations}
            aria-label="Open organizations tab">
            <span class="orgName">{selectedOrg?.name ?? 'Organization'}</span>
            <span class="not-mobile"
                >{#if selectedOrg?.tierName}<Badge
                        variant="secondary"
                        content={selectedOrg?.tierName} />{/if}</span>
            <Icon icon={IconChevronDown} size="s" />
        </button>
    {:else}
        <button
            type="button"
            class="trigger"
            on:click={() => {
                organisationBottomSheetOpen = true;
            }}
            aria-label="Open organizations tab">
            <span class="orgName">{selectedOrg?.name ?? 'Organization'}</span>
            <span class="not-mobile"
                ><Badge variant="secondary" content={selectedOrg?.tierName ?? ''} /></span>
            <Icon icon={IconChevronDown} size="s" />
        </button>
    {/if}

    <div class="menu" use:melt={$menuOrganizations}>
        {#if selectedOrg}
            <div use:melt={$itemOrganizations}>
                <ActionMenu.Root>
                    <ActionMenu.Item.Anchor href={`/console/organization-${selectedOrg?.$id}`}
                        >Organization overview</ActionMenu.Item.Anchor
                    ></ActionMenu.Root>
            </div>
            {#if organizations.length > 1}
                <div class="separator" use:melt={$separatorOrganizations} />

                <div use:melt={$subTriggerOrganizations}>
                    <ActionMenu.Root>
                        <ActionMenu.Item.Button trailingIcon={IconChevronRight}
                            >Switch organization</ActionMenu.Item.Button>
                    </ActionMenu.Root>
                </div>
                <div class="menu subMenu" use:melt={$subMenuOrganizations}>
                    <div use:melt={$radioGroupOrganizations}>
                        {#each organizations as organization}
                            <div use:melt={$itemOrganizations}>
                                <ActionMenu.Root>
                                    <ActionMenu.Item.Anchor
                                        href={`/console/organization-${organization?.$id}`}
                                        >{organization.name}</ActionMenu.Item.Anchor>
                                </ActionMenu.Root>
                            </div>
                        {/each}
                        <div class="separator" use:melt={$separatorOrganizations} />
                        <div use:melt={$itemOrganizations}>
                            <ActionMenu.Root>
                                <ActionMenu.Item.Anchor
                                    href="/console/create-organization"
                                    leadingIcon={IconPlusSm}
                                    title="">Create organization</ActionMenu.Item.Anchor
                                ></ActionMenu.Root>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="separator" use:melt={$separatorOrganizations} />
                <div use:melt={$itemOrganizations}>
                    <ActionMenu.Root>
                        <ActionMenu.Item.Anchor
                            href="/console/create-organization"
                            leadingIcon={IconPlusSm}>Create organization</ActionMenu.Item.Anchor
                        ></ActionMenu.Root>
                </div>
            {/if}
        {:else}
            {#each organizations as organization}
                <div use:melt={$itemOrganizations}>
                    <ActionMenu.Root>
                        <ActionMenu.Item.Anchor href={`/console/organization-${organization?.$id}`}
                            >{organization.name}</ActionMenu.Item.Anchor
                        ></ActionMenu.Root>
                </div>
            {/each}
            <div class="separator" use:melt={$separatorOrganizations} />
            <div use:melt={$itemOrganizations}>
                <ActionMenu.Root>
                    <ActionMenu.Item.Anchor
                        href="/console/create-organization"
                        leadingIcon={IconPlusSm}>Create organization</ActionMenu.Item.Anchor
                    ></ActionMenu.Root>
            </div>
        {/if}
    </div>

    {#if selectedOrg && selectedProject}
        <span class="breadcrumb-separator">/</span>
        {#if !$isSmallViewport}
            <button
                type="button"
                class="trigger"
                use:melt={$triggerProjects}
                aria-label="Open projects tab">
                <span class="projectName">{selectedProject.name}</span>
                <Icon icon={IconChevronDown} size="s" />
            </button>
        {:else}
            <button
                type="button"
                class="trigger"
                on:click={() => (projectsBottomSheetOpen = true)}
                aria-label="Open projects tab">
                <span class="projectName">{selectedProject.name}</span>
                <Icon icon={IconChevronDown} size="s" />
            </button>
        {/if}

        <div class="menu" use:melt={$menuProjects}>
            {#if selectedOrg.projects.length > 1}
                {#each selectedOrg.projects as project, index}
                    {#if index < 4}
                        <div use:melt={$itemProjects}>
                            <ActionMenu.Root>
                                <ActionMenu.Item.Anchor href={`/console/project-${project.$id}`}
                                    >{project.name}</ActionMenu.Item.Anchor
                                ></ActionMenu.Root>
                        </div>
                    {:else if index === 4}
                        <div use:melt={$itemProjects}>
                            <ActionMenu.Root>
                                <ActionMenu.Item.Anchor
                                    href={`/console/organization-${selectedOrg.$id}`}
                                    >All projects</ActionMenu.Item.Anchor
                                ></ActionMenu.Root>
                        </div>
                    {/if}
                {/each}
                <div class="separator" use:melt={$separatorProjects} />
            {/if}
            <div use:melt={$itemProjects}>
                <ActionMenu.Root>
                    <ActionMenu.Item.Anchor
                        leadingIcon={IconPlusSm}
                        href={`/console/organization-${selectedOrg?.$id}?create-project`}
                        >Create project</ActionMenu.Item.Anchor
                    ></ActionMenu.Root>
            </div>
        </div>
    {/if}
</div>
<BottomSheet.Menu bind:isOpen={organisationBottomSheetOpen} menu={organizationsBottomSheet}
></BottomSheet.Menu>
<BottomSheet.Menu bind:isOpen={projectsBottomSheetOpen} menu={projectsBottomSheet}
></BottomSheet.Menu>

<style lang="scss">
    .menu {
        display: flex;
        flex-direction: column;
        outline: none !important;
        min-width: 220px;
        border-radius: var(--border-radius-m, 12px);
        border: 1px solid var(--color-border-neutral, #ededf0);
        background: var(--color-bgcolor-neutral-primary, #fff);
        z-index: 20;

        /* box-shadow/neutral/L */
        box-shadow:
            -2px 8px 16px 0px rgba(0, 0, 0, 0.02),
            -2px 20px 24px 0px rgba(0, 0, 0, 0.02);
    }

    .not-mobile {
        display: none;

        @media (min-width: 768px) {
            display: block;
        }
    }

    .subMenu {
        min-width: 220px;
        margin-inline: -4px;
        margin-block: -4px;
    }

    .orgName,
    .projectName {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 60px;

        @media (min-width: 390px) {
            max-width: 95px;
        }

        @media (min-width: 400px) {
            max-width: 105px;
        }

        @media (min-width: 800px) {
            max-width: 125px;
        }

        @media (min-width: 1024px) {
            max-width: 150px;
        }
    }

    .item:first-of-type {
        margin-top: 4px;
    }
    .item:last-of-type,
    .switch-org {
        margin-bottom: 4px;
    }

    :global(.item[data-highlighted]) {
        border-radius: var(--border-radius-S, 8px);
        background: var(--color-overlay-neutral-hover, rgba(25, 25, 28, 0.03));
    }
    .trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-1, 2px) var(--space-2, 4px);
        gap: var(--space-2, 4px);
        margin: 0 var(--space-5, 10px) 0 var(--space-5, 10px);

        transition: color 0.2s ease;

        color: var(--color-fgcolor-neutral-primary, #2d2d31);
        border-radius: var(--corner-radius-medium, 8px);

        cursor: default;
        /* Body text/level 2 Regular */
        font-family: Inter;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 21px */
    }

    .trigger:hover {
        background: var(--color-overlay-neutral-hover, rgba(25, 25, 28, 0.03));
    }

    :global(.trigger[data-highlighted]) {
        outline: none;
        background: var(--color-bgcolor-neutral-secondary, #f4f4f7);
    }

    :global(.trigger[data-highlighted]:focus) {
        outline: none;
        box-shadow: 0 0 0 2px var(--color-bgcolor-neutral-secondary, #f4f4f7);
    }

    .trigger:focus {
        z-index: 30;
        box-shadow:
            var(--shadow-offsetx-0, 0px) var(--shadow-offsety-0, 0px) 0 2px
                var(--color-bgcolor-neutral-default, #fafafb),
            0 0 0 4px var(--color-border-focus, #818186);
    }
    .separator {
        margin: 5px 0;
        height: 1px;
        background-color: var(--color-border-neutral);
    }
    .breadcrumb-separator {
        color: var(--color-fgcolor-neutral-tertiary, #97979b);
    }
</style>
