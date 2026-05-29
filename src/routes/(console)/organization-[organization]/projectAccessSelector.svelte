<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { projectRoles } from '$lib/stores/billing';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconTrash } from '@appwrite.io/pink-icons-svelte';

    type ProjectAccess = { projectId: string; roleName: string };

    let {
        projectAccess = $bindable<ProjectAccess[]>([]),
        projects = []
    }: {
        projectAccess: ProjectAccess[];
        projects: Models.Project[];
    } = $props();

    function availableProjects(currentId: string) {
        const taken = new Set(
            projectAccess.map((a) => a.projectId).filter((id) => id !== currentId)
        );
        return projects
            .filter((p) => !taken.has(p.$id))
            .map((p) => ({ label: p.name, value: p.$id }));
    }

    const allSelected = $derived(projects.length === 0 || projectAccess.length >= projects.length);

    function addRow() {
        projectAccess = [...projectAccess, { projectId: '', roleName: 'developer' }];
    }

    function removeRow(i: number) {
        projectAccess = projectAccess.filter((_, idx) => idx !== i);
    }
</script>

<Layout.Stack gap="s">
    {#each projectAccess as access, i}
        <Layout.Stack direction="row" gap="s" alignItems="flex-end">
            <div style:flex="1">
                <InputSelect
                    id="project-{i}"
                    label={i === 0 ? 'Project' : ''}
                    required
                    options={availableProjects(access.projectId)}
                    bind:value={access.projectId}
                    placeholder="Select project" />
            </div>
            <div style:width="140px">
                <InputSelect
                    id="project-role-{i}"
                    label={i === 0 ? 'Role' : ''}
                    required
                    options={projectRoles}
                    bind:value={access.roleName} />
            </div>
            <div style:padding-bottom="2px">
                <Button text icon size="s" on:click={() => removeRow(i)}>
                    <Icon size="s" icon={IconTrash} />
                </Button>
            </div>
        </Layout.Stack>
    {/each}
    <div>
        <Button secondary size="s" on:click={addRow} disabled={allSelected}>
            <Icon size="s" icon={IconPlus} slot="start" />
            Add project
        </Button>
    </div>
</Layout.Stack>
