<script lang="ts">
    import { base } from '$app/paths';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import Create from './createProjectCloud.svelte';
    import CreateProject from './createProject.svelte';
    import CreateOrganization from '../createOrganization.svelte';
    import { wizard } from '$lib/stores/wizard';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { page } from '$app/stores';
    import { registerCommands } from '$lib/commandCenter';
    import {
        CardContainer,
        DropList,
        DropListItem,
        Empty,
        GridItem1,
        Heading,
        PaginationWithLimit
    } from '$lib/components';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { services } from '$lib/stores/project-services';
    import { sdk } from '$lib/stores/sdk';
    import { loading } from '$routes/store';
    import type { Models } from '@appwrite.io/console';
    import { ID, Region } from '@appwrite.io/console';
    import { openImportWizard } from '../project-[region]-[project]/settings/migrations/(import)';
    import { readOnly } from '$lib/stores/billing';
    import { onMount } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { canWriteProjects } from '$lib/stores/roles';
    import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
    import { regions as regionsStore } from '$routes/(console)/organization-[organization]/store';

    export let data;

    let showCreate = false;
    let addOrganization = false;

    const getPlatformInfo = (platform: string) => {
        let name: string, icon: string;
        if (platform.includes('flutter')) {
            name = 'Flutter';
            icon = 'flutter';
        } else if (platform.includes('apple')) {
            name = 'Apple';
            icon = 'apple';
        } else if (platform.includes('android')) {
            name = 'Android';
            icon = 'android';
        } else if (platform.includes('unity')) {
            name = 'Unity';
            icon = 'unity';
        } else if (platform.includes('web')) {
            name = 'Web';
            icon = 'code';
        } else {
            name = 'Unknown';
            icon = 'unknown';
        }
        return { name, icon };
    };

    function allServiceDisabled(project: Models.Project): boolean {
        let disabled = true;
        services.load(project);
        $services.list.forEach((service) => {
            if (service.value) {
                disabled = false;
            }
        });
        return disabled;
    }

    function filterPlatforms(platforms: { name: string; icon: string }[]) {
        return platforms.filter(
            (value, index, self) => index === self.findIndex((t) => t.name === value.name)
        );
    }

    function handleCreateProject() {
        if (!$canWriteProjects) return;
        if (isCloud) wizard.start(Create);
        else showCreate = true;
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
            icon: 'plus'
        }
    ]);

    let showDropdown = false;

    const importProject = async () => {
        try {
            loading.set(true);
            const project = await sdk.forConsole.projects.create(
                ID.unique(),
                `Imported project ${new Date().toISOString()}`,
                $page.params.organization,
                Region.Default
            );
            trackEvent(Submit.ProjectCreate, {
                teamId: $page.params.organization
            });
            await goto(`${base}/project-${project.region}-${project.$id}/settings/migrations`);
            openImportWizard();
            loading.set(false);
        } catch (e) {
            trackError(e, Submit.ProjectCreate);
        }
    };
    onMount(async () => {
        if (isCloud && $organization.$id) {
            const regions = await sdk.forConsole.billing.listRegions($organization.$id);
            regionsStore.set(regions);
            checkPricingRefAndRedirect($page.url.searchParams);
        }
    });

    function findRegion(project: Models.Project) {
        return $regionsStore?.regions?.find((region) => region.$id === project.region);
    }
</script>

{#if $organization?.$id}
    <Container>
        <div class="u-flex u-gap-12 common-section u-main-space-between">
            <Heading tag="h2" size="5">Projects</Heading>

            <DropList bind:show={showDropdown} placement="bottom-end">
                {#if $canWriteProjects}
                    <Button
                        on:click={handleCreateProject}
                        event="create_project"
                        disabled={$readOnly && !GRACE_PERIOD_OVERRIDE}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create project</span>
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

        {#if data.projects.total}
            <CardContainer
                showEmpty={$canWriteProjects}
                total={data.projects.total}
                offset={data.offset}
                on:click={handleCreateProject}>
                {#each data.projects.projects as project}
                    {@const platforms = filterPlatforms(
                        project.platforms.map((platform) => getPlatformInfo(platform.type))
                    )}
                    <li>
                        <GridItem1 href={`${base}/project-${project.region}-${project.$id}`}>
                            <svelte:fragment slot="eyebrow">
                                {project?.platforms?.length ? project?.platforms?.length : 'No'} apps
                            </svelte:fragment>
                            <svelte:fragment slot="title">
                                {project.name}
                            </svelte:fragment>
                            {#if allServiceDisabled(project)}
                                <p>
                                    <span class="icon-pause" aria-hidden="true" /> All services are disabled.
                                </p>
                            {/if}

                            {#each platforms as platform, i}
                                {#if i < 3}
                                    <Pill>
                                        <span class={`icon-${platform.icon}`} aria-hidden="true" />
                                        {platform.name}
                                    </Pill>
                                {/if}
                            {/each}
                            {#if platforms?.length > 3}
                                <Pill>
                                    +{project.platforms.length - 3}
                                </Pill>
                            {/if}
                            <svelte:fragment slot="icons">
                                {#if isCloud && $regionsStore?.regions}
                                    {@const region = findRegion(project)}
                                    <span class="u-color-text-gray u-medium u-line-height-2">
                                        {region?.name}
                                    </span>
                                {/if}
                            </svelte:fragment>
                        </GridItem1>
                    </li>
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
    <CreateProject bind:show={showCreate} teamId={$page.params.organization} />
{/if}
