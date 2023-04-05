<script lang="ts">
    import { base } from '$app/paths';
    import { Pill } from '$lib/elements';
    import { GridItem1, Heading, Empty, CardContainer, Pagination, Limit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import CreateProject from './createProject.svelte';
    import CreateOrganization from '../createOrganization.svelte';
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { services } from '$lib/stores/project-services';
    import type { Models } from '@appwrite.io/console';

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

    function allServiceDisabled(project: Models.Projectj): boolean {
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
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Projects</Heading>
        <Button on:click={() => (showCreate = true)} event="create_project">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create project</span>
        </Button>
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
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <Limit limit={data.limit} sum={data.projects.total} name="Projects" />
        <Pagination limit={data.limit} offset={data.offset} sum={data.projects.total} />
    </div>
</Container>

<CreateOrganization bind:show={addOrganization} />
<CreateProject bind:show={showCreate} teamId={$page.params.organization} />
