<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { DropList, GridItem1, CardContainer } from '$lib/components';
    import {
        Badge,
        Icon,
        Typography,
        Tag,
        Accordion,
        ActionMenu,
        Popover,
        Layout
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
    import { BillingPlan } from '$lib/constants';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Modal } from '$lib/components';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { isCloud } from '$lib/system';
    import { regions as regionsStore } from '$lib/stores/organization';

    // props
    interface Props {
        projectsToArchive: Models.Project[];
        organization: Models.Organization;
        currentPlan: {
            projects: number;
            [key: string]: any;
        };
    }

    let { projectsToArchive, organization, currentPlan }: Props = $props();

    // Track Read-only info droplist per archived project
    let readOnlyInfoOpen = $state<Record<string, boolean>>({});
    let showUnarchiveModal = $state(false);
    let projectToUnarchive = $state<Models.Project | null>(null);

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

    // Check if unarchive should be disabled
    function isUnarchiveDisabled(): boolean {
        if (!organization || !currentPlan) return true;

        if (organization.billingPlan === BillingPlan.FREE) {
            const currentProjectCount = organization.projects?.length || 0;
            const projectLimit = currentPlan.projects || 0;

            return currentProjectCount >= projectLimit;
        }

        return false;
    }

    function handleMigrateProject(project: Models.Project) {
        goto(`${base}/project-${project.region}-${project.$id}/settings/migrations`);
    }

    // Handle unarchive project action
    async function handleUnarchiveProject(project: Models.Project) {
        projectToUnarchive = project;
        showUnarchiveModal = true;
    }

    // Confirm unarchive action
    async function confirmUnarchive() {
        if (!projectToUnarchive) return;

        try {
            if (!organization) {
                addNotification({
                    type: 'error',
                    message: 'Organization not found'
                });
                return;
            }

            const currentSelectedProjects = organization.projects ?? [];
            const updatedProjects = Array.from(
                new Set([...currentSelectedProjects, projectToUnarchive.$id])
            );

            await sdk.forConsole.billing.updateSelectedProjects(organization.$id, updatedProjects);

            await invalidate(Dependencies.ORGANIZATION);

            addNotification({
                type: 'success',
                message: `${projectToUnarchive.name} has been unarchived`
            });

            showUnarchiveModal = false;
            projectToUnarchive = null;
        } catch (error) {
            const msg =
                error && typeof error === 'object' && 'message' in error
                    ? String((error as any).message)
                    : 'Failed to unarchive project';
            addNotification({ type: 'error', message: msg });
        }
    }

    function cancelUnarchive() {
        showUnarchiveModal = false;
        projectToUnarchive = null;
    }

    function findRegion(project: Models.Project) {
        return $regionsStore.regions.find((region) => region.$id === project.region);
    }

    import { formatName as formatNameHelper } from '$lib/helpers/string';
    function formatName(name: string, limit: number = 19) {
        return formatNameHelper(name, limit, $isSmallViewport);
    }
</script>

{#if projectsToArchive.length > 0}
    <div class="archive-projects-margin-top">
        <Accordion title="Archived projects" badge={`${projectsToArchive.length}`}>
            <Typography.Text tag="p" size="s">
                These projects have been archived and are read-only. You can view and migrate their
                data.
            </Typography.Text>

            <div class="archive-projects-margin">
                <CardContainer disableEmpty={true} total={projectsToArchive.length}>
                    {#each projectsToArchive as project}
                        {@const platforms = filterPlatforms(
                            project.platforms.map((platform) => getPlatformInfo(platform.type))
                        )}
                        {@const formatted = formatName(project.name)}
                        <GridItem1>
                            <svelte:fragment slot="eyebrow">
                                {project?.platforms?.length ? project?.platforms?.length : 'No'} apps
                            </svelte:fragment>
                            <svelte:fragment slot="title">{formatted}</svelte:fragment>
                            <svelte:fragment slot="status">
                                <div class="status-container">
                                    <DropList
                                        bind:show={readOnlyInfoOpen[project.$id]}
                                        placement="bottom-start"
                                        noArrow>
                                        <Tag
                                            size="s"
                                            style="white-space: nowrap;"
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
                                            <ActionMenu.Item.Button
                                                leadingIcon={IconInboxIn}
                                                disabled={isUnarchiveDisabled()}
                                                on:click={() => handleUnarchiveProject(project)}
                                                >Unarchive project</ActionMenu.Item.Button>
                                            <ActionMenu.Item.Button
                                                leadingIcon={IconSwitchHorizontal}
                                                on:click={() => handleMigrateProject(project)}
                                                >Migrate project</ActionMenu.Item.Button>
                                        </ActionMenu.Root>
                                    </Popover>
                                </div>
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

                            {#if platforms.length > 3}
                                <Badge
                                    variant="secondary"
                                    content={`+${platforms.length - 2}`}
                                    style="width: max-content;" />
                            {/if}

                            <svelte:fragment slot="icons">
                                {#if isCloud && $regionsStore?.regions}
                                    {@const region = findRegion(project)}
                                    <Typography.Text>{region?.name}</Typography.Text>
                                {/if}
                            </svelte:fragment>
                        </GridItem1>
                    {/each}
                </CardContainer>
            </div>
        </Accordion>
    </div>
{/if}

<!-- Unarchive Confirmation Modal -->
<Modal bind:show={showUnarchiveModal} title="Unarchive project">
    <p>Are you sure you want to unarchive <strong>{projectToUnarchive?.name}</strong>?</p>
    <p>This will move the project back to your active projects list.</p>

    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button secondary on:click={cancelUnarchive}>Cancel</Button>
            <Button on:click={confirmUnarchive}>Unarchive</Button>
        </Layout.Stack>
    </svelte:fragment>
</Modal>

<style>
    .archive-projects-margin-top {
        margin-top: 36px;
    }

    .archive-projects-margin {
        margin-top: 16px;
        margin-bottom: 36px;
    }
    .status-container {
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>
