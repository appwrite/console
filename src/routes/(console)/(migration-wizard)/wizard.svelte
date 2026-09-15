<script lang="ts">
    import { page } from '$app/state';
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { capitalize } from '$lib/helpers/string';
    import ResourceForm from './resource-form.svelte';
    import { requestedMigration } from '$routes/store';
    import { formData, provider, selectedProject, selectedRegion } from '.';
    import { ID, type Models, Query, AppwriteMigrationResource } from '@appwrite.io/console';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import {
        Button,
        Card,
        Fieldset,
        Icon,
        Input,
        Layout,
        Skeleton,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { isCloud } from '$lib/system';
    import { regions } from '$lib/stores/organization';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { migrationFormToResources } from '$lib/stores/migration';
    import { EyebrowHeading } from '$lib/components';
    import {
        IconAppwrite,
        IconCog,
        IconCurrencyDollar,
        IconExclamation,
        IconTrendingUp
    } from '@appwrite.io/pink-icons-svelte';
    import { Dependencies } from '$lib/constants';
    import { filterRegions } from '$lib/helpers/regions';

    const onExit = () => {
        formData.reset();
        selectedProject.set(null);
        requestedMigration.set(null);
    };

    const organizations = page.data.organizations
        .teams as Models.TeamList<Models.Preferences>['teams'];

    let showExitModal = false;
    let showResources = false;
    let loadingProjects = false;
    let creatingProject = false;
    let errorInResources = false;
    let migrationStarted = false;
    let migrationAttempted = false;
    let cancelling = false;
    let creation: Promise<Models.Project | null> | null = null;
    let projectSdkInstance: ReturnType<typeof sdk.forProject> | null = null;

    let projects = [] as Models.ProjectList['projects'];
    let selectedOrg = organizations.length ? organizations[0].$id : null;

    let newProjName = '';
    let projectType: 'existing' | 'new' = 'existing';
    let targetProject: Models.Project | null = null;
    let newlyCreatedProject: Models.Project | null = null;
    let createdFor: { organization: string; name: string; region: string } | null = null;

    async function discardCreatedProject() {
        if (!newlyCreatedProject || migrationAttempted) return;
        try {
            await sdk
                .forProject(newlyCreatedProject.region, newlyCreatedProject.$id)
                .project.delete();
        } catch (error) {
            if (error.code !== 404) throw error;
        }
        newlyCreatedProject = null;
        createdFor = null;
        await invalidate(Dependencies.PROJECTS);
    }

    async function beforeExit() {
        if (migrationStarted) return false;
        cancelling = true;
        try {
            await creation;
            await discardCreatedProject();
            return true;
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            return false;
        } finally {
            cancelling = false;
        }
    }

    async function next() {
        if (creatingProject || cancelling) return;
        creatingProject = true;
        creation = prepareProject();
        const project = await creation;
        creation = null;
        creatingProject = false;
        if (!project || cancelling) return;
        targetProject = project;
        projectSdkInstance = sdk.forProject(project.region, project.$id);
        showResources = true;
    }

    async function getProjects(orgId: string | null) {
        if (!orgId) {
            projects = [];
        } else {
            loadingProjects = true;
            projects = await sdk.forConsole
                .organization(orgId)
                .listProjects({
                    queries: [Query.equal('teamId', orgId), Query.orderDesc('$createdAt')]
                })
                .then((res) => res.projects);

            loadingProjects = false;
            projectType = projects.length ? 'existing' : 'new';
            if (projectType === 'existing') {
                const first = projects[0];
                $selectedProject = first.$id;
                projectSdkInstance = sdk.forProject(first.region, first.$id);
            }
        }
    }

    async function prepareProject(): Promise<Models.Project | null> {
        const organization = selectedOrg;
        const name = newProjName.trim();
        const region = $selectedRegion;
        const existing = isExisting ? currentSelectedProject : null;
        try {
            if (existing) {
                await discardCreatedProject();
                return existing;
            }
            if (
                newlyCreatedProject &&
                createdFor?.organization === organization &&
                createdFor.name === name &&
                createdFor.region === region
            ) {
                return newlyCreatedProject;
            }
            await discardCreatedProject();
            newlyCreatedProject = await sdk.forConsole.organization(organization).createProject({
                projectId: ID.unique(),
                name,
                region
            });
            createdFor = { organization, name, region };
            migrationAttempted = false;
            return newlyCreatedProject;
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            return null;
        }
    }

    const onFinish = async () => {
        if ($provider.provider !== 'appwrite' || migrationStarted || cancelling) return;

        migrationStarted = true;
        const resources = migrationFormToResources($formData, $provider.provider);

        // A failed response can still mean the server started importing data.
        // From this point, the destination must be kept even if the user exits.
        migrationAttempted = true;
        try {
            await projectSdkInstance.migrations.createAppwriteMigration({
                resources: resources as AppwriteMigrationResource[],
                endpoint: $provider.endpoint,
                projectId: $provider.projectID,
                apiKey: $provider.apiKey
            });

            addNotification({
                type: 'success',
                message: 'Migration started'
            });
            onExit();
            wizard.hide();
            await invalidate(Dependencies.PROJECTS);
            await goto(
                `${base}/project-${targetProject.region ?? 'default'}-${targetProject.$id}/settings/migrations`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            migrationStarted = false;
        }
    };

    $: getProjects(selectedOrg);

    $: currentSelectedProject = projects.find((project) => project.$id === $selectedProject);

    $: isExisting = projectType === 'existing';

    $: if (isExisting && currentSelectedProject) {
        projectSdkInstance = sdk.forProject(
            currentSelectedProject.region,
            currentSelectedProject.$id
        );
    }

    $: disableNextButton =
        creatingProject ||
        cancelling ||
        loadingProjects ||
        (isExisting ? !currentSelectedProject : newProjName.trim() === '');

    $: isFinalsButtonEnabled =
        showResources &&
        !errorInResources &&
        !disableNextButton &&
        Object.values($formData).some((category) =>
            Object.values(category).some((value) => value === true)
        );
</script>

<Wizard title="Create migration" bind:showExitModal confirmExit {onExit} {beforeExit}>
    <svelte:fragment slot="exit">
        {#if newlyCreatedProject && !migrationAttempted}
            Exit this migration and delete the new project "{newlyCreatedProject.name}"?
        {:else}
            Exit this migration setup? Existing projects and any migration already submitted will be
            kept.
        {/if}
    </svelte:fragment>
    <Layout.Stack gap="xl">
        {#if !showResources}
            <Layout.Stack gap="xxl">
                {#if organizations.length >= 1}
                    <Fieldset legend="Organization">
                        <InputSelect
                            required
                            id="organization"
                            bind:value={selectedOrg}
                            label="Select organization"
                            options={organizations.map((project) => ({
                                label: project.name,
                                value: project.$id
                            }))}
                            disabled={loadingProjects || creatingProject || cancelling} />
                    </Fieldset>
                {/if}

                <Fieldset legend="Project">
                    {#if loadingProjects}
                        <Layout.Stack gap="xl">
                            <Layout.Grid rowGap="l" columns={2} columnsS={1}>
                                <Skeleton variant="line" width="100%" height={70} />
                                <Skeleton variant="line" width="100%" height={70} />
                            </Layout.Grid>
                            <Skeleton variant="line" width="100%" height={50} />
                        </Layout.Stack>
                    {:else}
                        <Layout.Stack gap="xl">
                            <Layout.Grid rowGap="l" columns={2} columnsXS={1}>
                                <Card.Selector
                                    bind:group={projectType}
                                    name="Existing project"
                                    id="existing"
                                    value="existing"
                                    title="Existing project"
                                    imageRadius="s">
                                    Import data to an existing project
                                </Card.Selector>

                                <Card.Selector
                                    bind:group={projectType}
                                    name="Existing project"
                                    id="new"
                                    value="new"
                                    title="Create new project"
                                    imageRadius="s">
                                    Import data to a new project
                                </Card.Selector>
                            </Layout.Grid>

                            {#if projectType === 'existing'}
                                <InputSelect
                                    required
                                    id="project"
                                    label="Select a project"
                                    bind:value={$selectedProject}
                                    options={projects.map((p) => ({
                                        label: p.name,
                                        value: p.$id
                                    }))} />
                            {:else}
                                <Layout.Stack gap="l">
                                    <InputText
                                        required
                                        id="project_name"
                                        label="Project name"
                                        bind:value={newProjName}
                                        placeholder="Enter project name" />

                                    {#if isCloud && $regions.regions.length > 0}
                                        <Input.Select
                                            required
                                            label="Region"
                                            options={filterRegions($regions.regions)}
                                            bind:value={$selectedRegion}
                                            placeholder="Select a region" />
                                        <Typography.Text
                                            >Region cannot be changed after creation</Typography.Text>
                                    {/if}
                                </Layout.Stack>
                            {/if}
                            <Layout.Stack direction="row" justifyContent="flex-end">
                                <Button.Button
                                    size="s"
                                    disabled={disableNextButton}
                                    on:click={next}>
                                    {#if creatingProject}
                                        <Spinner size="s" />
                                    {/if}

                                    Next
                                </Button.Button>
                            </Layout.Stack>
                        </Layout.Stack>
                    {/if}
                </Fieldset>
            </Layout.Stack>
        {:else}
            <Card.Base radius="s" padding="s">
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xs">
                    <Layout.Stack gap="s" direction="row" alignItems="center">
                        <Icon icon={IconAppwrite} color="--fgcolor-neutral-primary" />

                        <Typography.Text variant="m-500">
                            {capitalize(targetProject?.name ?? 'New project')}
                        </Typography.Text>
                    </Layout.Stack>

                    <Button.Button
                        size="s"
                        variant="secondary"
                        disabled={migrationStarted || cancelling}
                        on:click={() => (showResources = !showResources)}>
                        Update
                    </Button.Button>
                </Layout.Stack>
            </Card.Base>
        {/if}

        {#if showResources}
            <Fieldset legend="Resources">
                <Layout.Stack gap="xl">
                    <ResourceForm
                        {provider}
                        {formData}
                        bind:errorInResources
                        migrationType="cloud"
                        projectSdk={projectSdkInstance} />
                </Layout.Stack>
            </Fieldset>
        {/if}
    </Layout.Stack>

    <svelte:fragment slot="aside">
        <Card.Base variant="primary" radius="s" padding="m">
            <Layout.Stack gap="l">
                <EyebrowHeading class="eyebrow" tag="h3" size={3}>Good to know</EyebrowHeading>

                <!-- tip 1 -->
                <Layout.Stack gap="l" direction="row" wrap="normal">
                    <span style:padding-block="2px">
                        <Icon icon={IconCog} size="s" />
                    </span>
                    <Layout.Stack gap="none">
                        <Typography.Text variant="m-600"
                            >Project settings are not imported</Typography.Text>
                        You will need to set service and project settings manually.
                    </Layout.Stack>
                </Layout.Stack>

                <!-- tip 2 -->
                <Layout.Stack gap="l" direction="row" wrap="normal">
                    <span style:padding-block="2px">
                        <Icon icon={IconTrendingUp} size="s" />
                    </span>
                    <Layout.Stack gap="none">
                        <Typography.Text variant="m-600"
                            >Keep your organization plan's limits in mind</Typography.Text>
                        Make sure to have enough storage in your organization plan when importing files.
                    </Layout.Stack>
                </Layout.Stack>

                <!-- tip 3 -->
                <Layout.Stack gap="l" direction="row" wrap="normal">
                    {@const isFirebase = $provider.provider === 'firebase'}
                    <span style:padding-block="3px">
                        <Icon
                            icon={isFirebase ? IconExclamation : IconCurrencyDollar}
                            size="s"
                            color={isFirebase ? '--fgcolor-warning' : undefined} />
                    </span>
                    <Layout.Stack gap="none">
                        <Typography.Text variant="m-600">
                            {isFirebase
                                ? 'Possible charges by Firebase'
                                : 'Transfer is free of charge'}
                        </Typography.Text>

                        {#if isFirebase}
                            Appwrite does not impose charges for importing data, but please note
                            that Firebase may have its own pricing for this service
                        {:else}
                            You won't be charged for Appwrite bandwidth usage for importing data
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button.Button
            variant="secondary"
            disabled={migrationStarted || cancelling}
            on:click={() => (showExitModal = true)}>
            Cancel
        </Button.Button>

        <Button.Button
            variant="primary"
            on:click={onFinish}
            disabled={!isFinalsButtonEnabled || migrationStarted || cancelling}>
            {#if migrationStarted}
                <Spinner size="s" />
            {/if}
            Create
        </Button.Button>
    </svelte:fragment>
</Wizard>
