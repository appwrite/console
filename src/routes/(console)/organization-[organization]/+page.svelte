<script lang="ts">
    import { base } from '$app/paths';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateProject from './createProject.svelte';
    import CreateOrganization from '../createOrganization.svelte';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { page } from '$app/state';
    import { registerCommands } from '$lib/commandCenter';
    import {
        CardContainer,
        DropList,
        DropListItem,
        Empty,
        GridItem1,
        PaginationWithLimit
    } from '$lib/components';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { sdk } from '$lib/stores/sdk';
    import { loading } from '$routes/store';
    import { ID, Region, type Models } from '@appwrite.io/console';
    import { openImportWizard } from '../project-[region]-[project]/settings/migrations/(import)';
    import { billingProjectsLimitDate, readOnly } from '$lib/stores/billing';
    import { onMount, type ComponentType } from 'svelte';
    import { canWriteProjects } from '$lib/stores/roles';
    import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
    import { Badge, Icon, Typography, Alert, Tag, Tooltip } from '@appwrite.io/pink-svelte';
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
    import { toLocaleDate } from '$lib/helpers/date';

    export let data;

    let showCreate = false;
    let showCreateProjectCloud = false;
    let addOrganization = false;
    let showSelectProject = false;

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

    let showDropdown = false;

    const importProject = async () => {
        try {
            loading.set(true);
            const project = await sdk.forConsole.projects.create(
                ID.unique(),
                `Imported project ${new Date().toISOString()}`,
                page.params.organization,
                Region.Fra // default
            );
            trackEvent(Submit.ProjectCreate, {
                teamId: page.params.organization
            });
            await goto(`${base}/project-${project.region}-${project.$id}/settings/migrations`);
            openImportWizard();
            loading.set(false);
        } catch (e) {
            trackError(e, Submit.ProjectCreate);
        }
    };
    onMount(async () => {
        checkPricingRefAndRedirect(page.url.searchParams);
    });

    function findRegion(project: Models.Project) {
        return $regionsStore.regions.find((region) => region.$id === project.region);
    }

    function isSetToArchive(project: Models.Project): boolean {
        if (!isCloud) return false;
        if (data.organization.projects?.length === 0) return false;
        if (!project || !project.$id) return false;
        return !data.organization.projects?.includes(project.$id);
    }

    function formatName(name: string, limit: number = 19) {
        const mobileLimit = 16;
        const actualLimit = $isSmallViewport ? mobileLimit : limit;
        return name ? (name.length > actualLimit ? `${name.slice(0, actualLimit)}...` : name) : '-';
    }

    $: projectsToArchive = data.projects.projects.filter(
        (project) => !data.organization.projects?.includes(project.$id)
    );
</script>

<SelectProjectCloud selectedProjects={data.organization.projects || []} bind:showSelectProject />

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Typography.Title>Projects</Typography.Title>

        <DropList bind:show={showDropdown} placement="bottom-end">
            {#if $canWriteProjects}
                <Button
                    on:click={handleCreateProject}
                    event="create_project"
                    disabled={$readOnly && !GRACE_PERIOD_OVERRIDE}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create project
                </Button>
            {/if}
            <svelte:fragment slot="list">
                <DropListItem on:click={() => (showCreate = true)}>Empty project</DropListItem>
                <DropListItem on:click={importProject}>
                    <div class="u-flex u-gap-8 u-cross-center">
                        Import project <span class="tag eyebrow-heading-3">Experimental</span>
                    </div>
                </DropListItem>
            </svelte:fragment>
        </DropList>
    </div>

    {#if isCloud && $currentPlan?.projects && $currentPlan?.projects > 0 && data.organization.projects.length > 0 && data.projects.total > 2 && $canWriteProjects}
        <Alert.Inline
            title={`${data.projects.total - data.organization.projects.length} projects will be archived on ${toLocaleDate(billingProjectsLimitDate)}`}>
            <Typography.Text>
                {#each projectsToArchive as project, index}{@const text = `<b>${project.name}</b>`}
                    {@html text}{index == projectsToArchive.length - 2
                        ? ', and '
                        : index < projectsToArchive.length - 1
                          ? ', '
                          : ''}
                {/each}
                will be archived
            </Typography.Text>
            <svelte:fragment slot="actions">
                <Button secondary size="s" on:click={() => (showSelectProject = true)}>
                    Manage projects
                </Button>
            </svelte:fragment>
        </Alert.Inline>
    {/if}

    {#if data.projects.total}
        <CardContainer
            disableEmpty={!$canWriteProjects}
            total={data.projects.total}
            offset={data.offset}
            on:click={handleCreateProject}>
            {#each data.projects.projects as project}
                {@const platforms = filterPlatforms(
                    project.platforms.map((platform) => getPlatformInfo(platform.type))
                )}
                {@const formatted = isSetToArchive(project)
                    ? formatName(project.name)
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
        total={data.projects.total} />
</Container>

<CreateOrganization bind:show={addOrganization} />
<CreateProject bind:show={showCreate} teamId={page.params.organization} />
<CreateProjectCloud
    projects={data.projects.total}
    bind:showCreateProjectCloud
    regions={$regionsStore.regions}
    teamId={page.params.organization} />
