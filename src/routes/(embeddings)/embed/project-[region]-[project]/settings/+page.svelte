<script lang="ts">
    import Container from '$lib/layout/container.svelte';
    import UpdateName from '$routes/(console)/project-[region]-[project]/settings/updateName.svelte';
    import DeleteProject from '$routes/(console)/project-[region]-[project]/settings/deleteProject.svelte';
    import { canWriteProjects } from '$lib/stores/roles';
</script>

<Container>
    <UpdateName />
    {#if $canWriteProjects}
        <DeleteProject />
    {/if}
</Container>
