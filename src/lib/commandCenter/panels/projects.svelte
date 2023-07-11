<!-- 
    This is the root command panel. It precedes all other command panels.
 -->
<script lang="ts">
    import { page } from '$app/stores';
    import type { Models } from '@appwrite.io/console';
    import Template from './template.svelte';
    import { goto } from '$app/navigation';

    let search = '';

    $: projects = $page.data.projects as Models.ProjectList;
    $: filteredProjects = projects.projects
        .filter((project) => project.name.toLowerCase().includes(search.toLowerCase()))
        .map((project) => {
            return {
                label: project.name,
                callback: () => {
                    goto(`/console/project-${project.$id}`);
                },
                group: 'projects'
            } as const;
        });
</script>

<Template options={filteredProjects} bind:search>
    <div class="option" slot="option" let:option>{option.label}</div>
</Template>
