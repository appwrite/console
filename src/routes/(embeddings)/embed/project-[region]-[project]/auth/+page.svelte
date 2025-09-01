<script lang="ts">
    import View from '$routes/(console)/project-[region]-[project]/auth/view.svelte';
    export let data;



</script>

<View
    users={data.users}
    limit={data.limit}
    offset={data.offset}
    pageNum={data.page}
    search={data.search}
/>
