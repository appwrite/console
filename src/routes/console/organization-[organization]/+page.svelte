<script lang="ts">
    import { base } from '$app/paths';
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
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';

    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Container } from '$lib/layout';
    import { services } from '$lib/stores/project-services';
    import { sdk } from '$lib/stores/sdk';
    import { loading } from '$routes/store';
    import type { Models } from '@appwrite.io/console';
    import { ID } from '@appwrite.io/console';
    import CreateOrganization from '../createOrganization.svelte';
    import { openImportWizard } from '../project-[project]/settings/migrations/(import)';
    import type { PageData } from './$types';
    import CreateProject from './createProject.svelte';

    export let data: PageData;

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

    $: $registerCommands([
        {
            label: 'Create project',
            callback: () => {
                showCreate = true;
            },
            keys: ['c'],
            disabled: showCreate,
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
                'default'
            );
            trackEvent(Submit.ProjectCreate, {
                teamId: $page.params.organization
            });
            await goto(`/console/project-${project.$id}/settings/migrations`);
            openImportWizard();
            loading.set(false);
        } catch (e) {
            trackError(e, Submit.ProjectCreate);
        }
    };
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Projects</Heading>
        <DropList bind:show={showDropdown} placement="bottom-end">
            <Button on:click={() => (showDropdown = true)} event="create_project">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create project</span>
            </Button>
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
            total={data.projects.total}
            offset={data.offset}
            event="project"
            on:click={() => (showCreate = true)}>
            {#each data.projects.projects as project}
                <GridItem1 href={`${base}/console/project-${project.$id}`}>
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
                    {@const platforms = filterPlatforms(
                        project.platforms.map((platform) => getPlatformInfo(platform.type))
                    )}
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
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new project</p>
            </svelte:fragment>
        </CardContainer>
    {:else}
        <Empty single on:click={() => (showCreate = true)}>
            <p>Create a new project</p>
        </Empty>
    {/if}

    <PaginationWithLimit
        name="Projects"
        limit={data.limit}
        offset={data.offset}
        total={data.projects.total} />
</Container>

<CreateOrganization bind:show={addOrganization} />
<CreateProject bind:show={showCreate} teamId={$page.params.organization} />
