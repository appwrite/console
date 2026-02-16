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
        Empty,
        EmptySearch,
        GridItem1,
        PaginationWithLimit,
        SearchQuery
    } from '$lib/components';
    import { trackEvent, Click } from '$lib/actions/analytics';
    import { type Models } from '@appwrite.io/console';
    import { getServiceLimit, readOnly, getChangePlanUrl } from '$lib/stores/billing';
    import { hideNotification, shouldShowNotification } from '$lib/helpers/notifications';
    import { onMount, type ComponentType } from 'svelte';
    import { canWriteProjects } from '$lib/stores/roles';
    import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
    import { Alert, Badge, Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import {
        IconAndroid,
        IconApple,
        IconCode,
        IconFlutter,
        IconPlus,
        IconReact,
        IconUnity
    } from '@appwrite.io/pink-icons-svelte';
    import type { PageProps } from './$types';
    import { getPlatformInfo } from '$lib/helpers/platform';
    import CreateProjectCloud from './createProjectCloud.svelte';
    import { regions as regionsStore } from '$lib/stores/organization';

    let { data }: PageProps = $props();

    let showCreate = $state(false);
    let addOrganization = $state(false);
    let showCreateProjectCloud = $state(false);
    let freePlanAlertDismissed = $state(false);

    let searchQuery: SearchQuery | null = $state(null);

    const projectCreationDisabled = $derived.by(() => {
        return (
            (isCloud &&
                getServiceLimit('projects', null, data.currentPlan) <= data.projects.total) ||
            (isCloud && $readOnly && !GRACE_PERIOD_OVERRIDE) ||
            !$canWriteProjects
        );
    });

    const reachedProjectLimit = $derived.by(() => {
        return (
            isCloud && getServiceLimit('projects', null, data.currentPlan) <= data.projects.total
        );
    });

    const projectsLimit = $derived.by(() => {
        return getServiceLimit('projects', null, data.currentPlan);
    });

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

    function dismissFreePlanAlert() {
        freePlanAlertDismissed = true;
        const notificationId = `freePlanAlert_${data.organization.$id}`;
        hideNotification(notificationId, { coolOffPeriod: 24 });

        trackEvent(Click.OrganizationClickUpgrade, {
            from: 'button',
            source: 'free_plan_info_alert_dismiss'
        });
    }

    onMount(async () => {
        checkPricingRefAndRedirect(page.url.searchParams);
        const notificationId = `freePlanAlert_${data.organization.$id}`;
        const shouldShow = shouldShowNotification(notificationId);
        freePlanAlertDismissed = !shouldShow;
    });

    function findRegion(project: Models.Project) {
        return $regionsStore.regions.find((region) => region.$id === project.region);
    }

    const activeProjectsTotal = $derived(data?.projects.total);

    function clearSearch() {
        searchQuery?.clearInput();
    }

    $effect(() => {
        $registerCommands([
            {
                label: 'Create project',
                callback: () => {
                    showCreate = true;
                },
                keys: ['c'],
                disabled: projectCreationDisabled,
                group: 'projects',
                icon: IconPlus
            }
        ]);
    });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between" class="common-section">
        <SearchQuery bind:this={searchQuery} placeholder="Search by name, label, or ID" />

        {#if $canWriteProjects}
            {#if projectCreationDisabled && reachedProjectLimit}
                <Tooltip placement="bottom">
                    <div>
                        <Button event="create_project" disabled>
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create project
                        </Button>
                    </div>
                    <span slot="tooltip">
                        You have reached your limit of {projectsLimit} projects.
                    </span>
                </Tooltip>
            {:else}
                <Button
                    on:click={handleCreateProject}
                    event="create_project"
                    disabled={projectCreationDisabled}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create project
                </Button>
            {/if}
        {/if}
    </Layout.Stack>

    {#if isCloud && !data.program && data.currentPlan?.projects && activeProjectsTotal <= data.currentPlan.projects && !freePlanAlertDismissed}
        <Alert.Inline dismissible on:dismiss={dismissFreePlanAlert}>
            <Typography.Text
                >Your Free plan includes up to {data.currentPlan?.projects} projects and limited resources.
                Upgrade to unlock more capacity and features.</Typography.Text>
            <svelte:fragment slot="actions">
                <Button
                    compact
                    size="s"
                    href={getChangePlanUrl(data.organization.$id)}
                    on:click={() => {
                        trackEvent(Click.OrganizationClickUpgrade, {
                            from: 'button',
                            source: 'free_plan_info_alert'
                        });
                    }}>
                    Upgrade to Pro
                </Button>
            </svelte:fragment>
        </Alert.Inline>
    {/if}

    {#if data.projects.total > 0}
        <CardContainer
            disableEmpty={!$canWriteProjects}
            total={activeProjectsTotal}
            offset={data.offset}
            on:click={handleCreateProject}>
            {#each data.projects.projects as project}
                {@const platforms = filterPlatforms(
                    project.platforms.map((platform) => getPlatformInfo(platform.type))
                )}
                <GridItem1
                    href={`${base}/project-${project.region}-${project.$id}/overview/platforms`}>
                    <svelte:fragment slot="eyebrow">
                        {project?.platforms?.length ? project?.platforms?.length : 'No'} apps
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        {project.name}
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
        total={activeProjectsTotal} />
</Container>
<CreateOrganization bind:show={addOrganization} />
<CreateProject bind:show={showCreate} teamId={page.params.organization} />
<CreateProjectCloud
    bind:showCreateProjectCloud
    projects={data.projects.total}
    regions={$regionsStore.regions}
    teamId={page.params.organization}
    currentPlan={data.currentPlan} />
