<script lang="ts">
    import { base } from '$app/paths';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateProject from './createProject.svelte';
    import CreateOrganization from '../createOrganization.svelte';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { page } from '$app/state';
    import { registerCommands } from '$lib/commandCenter';
    import { formatName as formatNameHelper } from '$lib/helpers/string';
    import {
        CardContainer,
        Empty,
        EmptySearch,
        GridItem1,
        PaginationWithLimit,
        SearchQuery
    } from '$lib/components';
    import { trackEvent, Click } from '$lib/actions/analytics';
    import { type Models } from '@appwrite.io/console';
    import { readOnly, upgradeURL } from '$lib/stores/billing';
    import { onMount, type ComponentType } from 'svelte';
    import { canWriteProjects } from '$lib/stores/roles';
    import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
    import { Alert, Badge, Icon, Layout, Tag, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        IconAndroid,
        IconApple,
        IconCode,
        IconFlutter,
        IconPlus,
        IconReact,
        IconUnity
    } from '@appwrite.io/pink-icons-svelte';
    import { getPlatformInfo } from '$lib/helpers/platform';
    import CreateProjectCloud from './createProjectCloud.svelte';
    import { currentPlan, regions as regionsStore } from '$lib/stores/organization';
    import SelectProjectCloud from '$lib/components/billing/alerts/selectProjectCloud.svelte';
    import ArchiveProject from '$lib/components/archiveProject.svelte';

    export let data;

    let showCreate = false;
    let addOrganization = false;
    let showSelectProject = false;
    let showCreateProjectCloud = false;

    let searchQuery: SearchQuery;

    function filterPlatforms(platforms: { name: string; icon: string }[]) {
        return platforms.filter(
            (value, index, self) => index === self.findIndex((t) => t.name === value.name)
        );
    }

    function handleCreateProject() {
        if (!$canWriteProjects) return;
        if (isCloud) showCreateProjectCloud = true;
        else showCreate = true;
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
                return null;
        }
    }

    $: $registerCommands([
        {
            label: 'Create project',
            callback: () => {
                showCreate = true;
            },
            keys: ['c'],
            disabled: ($readOnly && !GRACE_PERIOD_OVERRIDE) || !$canWriteProjects,
            group: 'projects',
            icon: IconPlus
        }
    ]);

    onMount(async () => checkPricingRefAndRedirect(page.url.searchParams));

    function findRegion(project: Models.Project) {
        return $regionsStore.regions.find((region) => region.$id === project.region);
    }

    function isSetToArchive(project: Models.Project): boolean {
        if (!isCloud) return false;
        if (!project || !project.$id) return false;
        return project.status !== 'active';
    }

    $: projectsToArchive = (data.archivedProjectsPage ?? data.projects.projects).filter(
        (project) => project.status !== 'active'
    );

    $: activeProjects = (data.activeProjectsPage ?? data.projects.projects).filter(
        (project) => project.status === 'active'
    );
    $: activeTotalOverall =
        data?.activeTotalOverall ??
        data?.organization?.projects?.length ??
        data?.projects?.total ??
        0;
    function clearSearch() {
        searchQuery?.clearInput();
    }
</script>

<SelectProjectCloud
    bind:showSelectProject
    organizationId={page.params.organization}
    selectedProjects={data.organization.projects || []} />

<Container>
    <Layout.Stack direction="row" justifyContent="space-between" class="common-section">
        <SearchQuery bind:this={searchQuery} placeholder="Search by name or ID" />

        {#if $canWriteProjects}
            <Button
                on:click={handleCreateProject}
                event="create_project"
                disabled={$readOnly && !GRACE_PERIOD_OVERRIDE}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create project
            </Button>
        {/if}
    </Layout.Stack>

    {#if isCloud && $currentPlan?.projects && $currentPlan?.projects > 0 && data.organization.projects.length > 0 && $canWriteProjects && (projectsToArchive.length > 0 || data.projects.total > $currentPlan.projects)}
        {@const difference = projectsToArchive.length}
        {@const messagePrefix = difference > 1 ? `${difference} projects` : `${difference} project`}
        <Alert.Inline title={`${messagePrefix} are archived`}>
            <Typography.Text>Upgrade your plan to restore archived projects</Typography.Text>
            <svelte:fragment slot="actions">
                <Button
                    compact
                    size="s"
                    href={$upgradeURL}
                    on:click={() => {
                        trackEvent(Click.OrganizationClickUpgrade, {
                            from: 'button',
                            source: 'projects_archive_alert'
                        });
                    }}>
                    Upgrade to Pro
                </Button>
            </svelte:fragment>
        </Alert.Inline>
    {/if}

    {#if activeProjects.length > 0}
        <CardContainer
            disableEmpty={!$canWriteProjects}
            total={activeTotalOverall}
            offset={data.offset}
            on:click={handleCreateProject}>
            {#each activeProjects as project}
                {@const platforms = filterPlatforms(
                    project.platforms.map((platform) => getPlatformInfo(platform.type))
                )}
                {@const formatted = isSetToArchive(project)
                    ? formatNameHelper(project.name, isSmallViewport ? 19 : 25)
                    : project.name}
                <GridItem1
                    href={`${base}/project-${project.region}-${project.$id}/overview/platforms`}>
                    <svelte:fragment slot="eyebrow">
                        {project?.platforms?.length ? project?.platforms?.length : 'No'} apps
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <Tooltip
                            maxWidth={project.name.length.toString()}
                            placement="top"
                            disabled={!isSetToArchive(project)}>
                            {formatted}
                            <span slot="tooltip">
                                {project.name}
                            </span>
                        </Tooltip>
                    </svelte:fragment>

                    <svelte:fragment slot="status">
                        {#if isSetToArchive(project)}
                            <Tag
                                size="s"
                                style="white-space: nowrap;"
                                on:click={(event) => {
                                    event.preventDefault();
                                    showSelectProject = true;
                                }}>Set to archive</Tag>
                        {/if}
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
                            <Typography.Text>{region.name}</Typography.Text>
                        {/if}
                    </svelte:fragment>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new project</p>
            </svelte:fragment>
        </CardContainer>
    {:else if data.search}
        <EmptySearch target="projects" hidePagination>
            <Button size="s" secondary on:click={clearSearch}>Clear search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            allowCreate={$canWriteProjects}
            on:click={handleCreateProject}
            target="project"
            href="https://appwrite.io/docs/quick-starts"></Empty>
    {/if}

    <PaginationWithLimit
        name="Projects"
        limit={data.limit}
        offset={data.offset}
        total={activeTotalOverall} />

    <!-- Archived Projects Section -->
    <ArchiveProject
        {projectsToArchive}
        organization={data.organization}
        currentPlan={$currentPlan}
        archivedTotalOverall={data.archivedTotalOverall}
        archivedOffset={data.archivedOffset}
        limit={data.limit} />
</Container>
<CreateOrganization bind:show={addOrganization} />
<CreateProject bind:show={showCreate} teamId={page.params.organization} />
<CreateProjectCloud
    projects={data.projects.total}
    bind:showCreateProjectCloud
    regions={$regionsStore.regions}
    teamId={page.params.organization} />
