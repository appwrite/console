<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardContainer, DropList, GridItem1 } from '$lib/components';
    import {
        Badge,
        Icon,
        Typography,
        Tag,
        Accordion,
        ActionMenu,
        Popover
    } from '@appwrite.io/pink-svelte';
    import {
        IconAndroid,
        IconApple,
        IconCode,
        IconFlutter,
        IconReact,
        IconUnity,
        IconInfo,
        IconDotsHorizontal,
        IconInboxIn,
        IconSwitchHorizontal
    } from '@appwrite.io/pink-icons-svelte';
    import { getPlatformInfo } from '$lib/helpers/platform';
    import type { Models } from '@appwrite.io/console';
    import type { ComponentType } from 'svelte';

    // props
    interface Props {
        projectsToArchive: Models.Project[];
    }

    let { projectsToArchive }: Props = $props();

    // Track Read-only info droplist per archived project
    let readOnlyInfoOpen = $state<Record<string, boolean>>({});

    function filterPlatforms(platforms: { name: string; icon: string }[]) {
        return platforms.filter(
            (value, index, self) => index === self.findIndex((t) => t.name === value.name)
        );
    }

    function getIconForPlatform(platform: string): ComponentType {
        switch (platform) {
            case 'code':
                return IconCode;
            case 'flutter':
                return IconFlutter;
            case 'apple':
                return IconApple;
            case 'android':
                return IconAndroid;
            case 'react-native':
                return IconReact;
            case 'unity':
                return IconUnity;
            default:
                return IconCode;
        }
    }
</script>

{#if projectsToArchive.length > 0}
    <div style="margin-top: 36px;">
        <Accordion title="Archived projects" badge={`${projectsToArchive.length}`}>
            <Typography.Text tag="p" size="s">
                These projects have been archived and are read-only. You can view and migrate their
                data.
            </Typography.Text>

            <div style="margin-top: 16px; margin-bottom: 36px;">
                <CardContainer>
                    {#each projectsToArchive as project}
                        {@const platforms = filterPlatforms(
                            project.platforms.map((platform) => getPlatformInfo(platform.type))
                        )}
                        <GridItem1>
                            <svelte:fragment slot="eyebrow">
                                {project?.platforms?.length ? project?.platforms?.length : 'No'} apps
                            </svelte:fragment>
                            <svelte:fragment slot="title">{project.name}</svelte:fragment>
                            <svelte:fragment slot="status">
                                <span style="display: flex; align-items: center; gap: 8px;">
                                    <DropList
                                        bind:show={readOnlyInfoOpen[project.$id]}
                                        placement="bottom-start"
                                        noArrow>
                                        <Tag
                                            size="s"
                                            style="white-space: nowrap; max-width: none;"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                readOnlyInfoOpen = {
                                                    ...readOnlyInfoOpen,
                                                    [project.$id]: !readOnlyInfoOpen[project.$id]
                                                };
                                            }}>
                                            <Icon icon={IconInfo} size="s" />
                                            <span>Read only</span>
                                        </Tag>
                                        <svelte:fragment slot="list">
                                            <li
                                                class="drop-list-item u-width-250"
                                                style="padding: var(--space-5, 12px) var(--space-6, 16px)">
                                                <span class="u-block u-mb-8">
                                                    Archived projects are read-only. You can view
                                                    and migrate their data, but they no longer
                                                    accept edits or requests.
                                                </span>
                                            </li>
                                        </svelte:fragment>
                                    </DropList>
                                    <Popover let:toggle padding="none" placement="bottom-end">
                                        <Button
                                            text
                                            icon
                                            size="s"
                                            ariaLabel="more options"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggle(e);
                                            }}>
                                            <Icon icon={IconDotsHorizontal} size="s" />
                                        </Button>
                                        <ActionMenu.Root slot="tooltip">
                                            <ActionMenu.Item.Button leadingIcon={IconInboxIn}
                                                >Unarchive project</ActionMenu.Item.Button>
                                            <ActionMenu.Item.Button
                                                leadingIcon={IconSwitchHorizontal}
                                                >Migrate project</ActionMenu.Item.Button>
                                        </ActionMenu.Root>
                                    </Popover>
                                </span>
                            </svelte:fragment>
                            {#each platforms.slice(0, 2) as platform}
                                {@const icon = getIconForPlatform(platform.icon)}
                                <Badge
                                    variant="secondary"
                                    content={platform.name}
                                    style="width: max-content;">
                                    <Icon {icon} size="s" slot="start" />
                                </Badge>
                            {/each}
                        </GridItem1>
                    {/each}
                </CardContainer>
            </div>
        </Accordion>
    </div>
{/if}
