<script lang="ts">
    import UserTargetsPage from '$routes/(console)/project-[region]-[project]/auth/user-[user]/targets/+page.svelte';
    let { data } = $props();
</script>

<UserTargetsPage data={data as any} />
