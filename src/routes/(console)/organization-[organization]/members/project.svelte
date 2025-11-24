<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import {
        Card,
        Empty,
        Layout,
        Link,
        Selector,
        Spinner,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { AvatarInitials, EmptySearch, PaginationInline } from '$lib/components';
    import { isSelfHosted } from '$lib/system';

    let {
        orgId,
        projectsWithRole = $bindable(),
        show = $bindable()
    }: {
        orgId: string;
        projectsWithRole: { project: Models.Project; role: string }[];
        show: boolean;
    } = $props();

    let selectedProjectsWithRole =
        $state<{ project: Models.Project; role: string }[]>(projectsWithRole);
    let search = $state('');
    let offset = $state(0);
    let isLoading = $state(false);
    let hasSelection = $state(false);
    let results: Models.ProjectList = $state(null);

    let defaultRole: string = isSelfHosted ? 'owner' : 'developer';

    async function request() {
        if (!show) return;
        isLoading = true;
        results = await sdk.forConsole.projects.list({
            queries: [Query.equal('teamId', orgId), Query.limit(5), Query.offset(offset)],
            search: search || undefined
        });
        isLoading = false;
    }

    function reset() {
        offset = 0;
        search = '';
        selectedProjectsWithRole = projectsWithRole;
        hasSelection = false;
    }

    function submit() {
        projectsWithRole = selectedProjectsWithRole;
        show = false;
        reset();
    }

    function toggleSelection(project: Models.Project) {
        const checked = selectedProjectsWithRole.some((p) => p.project.$id === project.$id);
        if (checked) {
            selectedProjectsWithRole = selectedProjectsWithRole.filter(
                (p) => p.project.$id !== project.$id
            );
        } else {
            selectedProjectsWithRole = [
                ...selectedProjectsWithRole,
                { project: project, role: defaultRole }
            ];
        }

        hasSelection = selectedProjectsWithRole.length > 0;
    }

    $effect(() => {
        if (show) {
            request();
        }
    });

    $effect(() => {
        selectedProjectsWithRole = projectsWithRole;
    });
</script>

<Modal title="Choose projects" bind:show onSubmit={submit} on:close={reset}>
    <Typography.Text slot="description"
        >Grant access to any project in the organization.</Typography.Text>
    <InputSearch autofocus placeholder="Search by name or ID" bind:value={search} />

    {#if results?.projects?.length}
        <Table.Root columns={[{ id: 'checkbox', width: 40 }, { id: 'project' }]} let:root>
            {#each results.projects as project (project.$id)}
                <Table.Row.Button {root} on:click={() => toggleSelection(project)}>
                    <Table.Cell column="checkbox" {root}>
                        <div style:pointer-events="none">
                            <Selector.Checkbox
                                size="s"
                                id={project.$id}
                                checked={selectedProjectsWithRole.some(
                                    (p) => p.project.$id === project.$id
                                )} />
                        </div>
                    </Table.Cell>
                    <Table.Cell column="project" {root}>
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            <AvatarInitials size="xs" name={project.name} />
                            <Layout.Stack gap="none">
                                <Typography.Caption variant="400"
                                    >{project.name}</Typography.Caption>
                                <Typography.Caption
                                    variant="400"
                                    color="--fgcolor-neutral-tertiary">
                                    {project.$id}
                                </Typography.Caption>
                            </Layout.Stack>
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Row.Button>
            {/each}
        </Table.Root>

        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <p class="text">Total results: {results?.total}</p>
            <PaginationInline
                limit={5}
                bind:offset
                total={results?.total}
                hidePages
                on:change={request} />
        </Layout.Stack>
    {:else if search}
        <EmptySearch bind:search target="projects" hidePages>
            <Button secondary on:click={() => (search = '')}>Clear search</Button>
        </EmptySearch>
    {:else if isLoading}
        <!-- 275px nearly matches the height of at-least 5 items in the table above -->
        <div style:margin-inline="auto" style:min-height="275px" style:align-content="center">
            <Spinner size="m" />
        </div>
    {:else}
        <Card.Base padding="none">
            <Empty title="No projects yet. Create a project to see it here." type="secondary">
                <Typography.Text slot="description">
                    Need a hand? Learn more in our <Link.Anchor
                        href="https://appwrite.io/docs/products/auth/users"
                        target="_blank"
                        rel="noopener noreferrer">
                        documentation</Link.Anchor
                    >.
                </Typography.Text>
            </Empty>
        </Card.Base>
    {/if}

    <svelte:fragment slot="footer">
        <Button submit disabled={!hasSelection}>Choose</Button>
    </svelte:fragment>
</Modal>
