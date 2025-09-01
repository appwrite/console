<script lang="ts">
    import View from '$routes/(console)/project-[region]-[project]/auth/teams/view.svelte';
    export let data;
</script>

<View
    teams={data.teams}
    limit={data.limit}
    offset={data.offset}
    pageNum={data.page}
    search={data.search}
/>
